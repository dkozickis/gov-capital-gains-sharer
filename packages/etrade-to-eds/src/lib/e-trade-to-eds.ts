import readXlsxFile from 'read-excel-file/node';
import got from 'got';
import { Stream } from 'stream';

const map = {
  'Date Acquired': 'dateAcquired',
  'Date Sold': 'dateSold',
  'Adjusted Cost Basis': 'costBasis',
  'Total Proceeds': 'totalProceeds',
} as const;

type TypeOfMap = typeof map;

export type Transaction = {
  [Key in keyof TypeOfMap as TypeOfMap[Key]]: string;
};

export function dateToISOString(date: string) {
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export async function getDateExchangeRate(date: string) {
  const csv = await got(
    `https://www.bank.lv/vk/ecb.csv?date=${date.replaceAll('-', '')}`
  ).text();

  const csvLines = csv.split(/(\r?\n)/);

  return parseFloat(
    csvLines.find((line) => line.includes('USD')).split(/\s+/)[1]
  );
}

export async function eTradeToEds(stream: Stream): Promise<Transaction[]> {
  const { rows } = await readXlsxFile<Transaction>(stream, {
    map,
  });

  const rowsWithISODates = rows
    .filter(({ dateAcquired }) => dateAcquired)
    .map(({ dateAcquired, dateSold, ...remaining }) => ({
      ...remaining,
      dateAcquired: dateToISOString(dateAcquired),
      dateSold: dateToISOString(dateSold),
    }));

  const uniqDates = [
    ...new Set(
      rowsWithISODates
        .map(({ dateAcquired, dateSold }) => [dateAcquired, dateSold])
        .flat()
    ),
  ];

  const exchangeRatesArray = await Promise.all(
    uniqDates.map(async (date) => [date, await getDateExchangeRate(date)])
  );

  const exchangeRates = Object.fromEntries(exchangeRatesArray) as Record<
    string,
    number
  >;

  return rowsWithISODates.map(
    ({ costBasis, totalProceeds, dateAcquired, dateSold }) => ({
      dateAcquired,
      dateSold,
      costBasis: (parseFloat(costBasis) / exchangeRates[dateAcquired]).toFixed(
        2
      ),
      totalProceeds: (
        parseFloat(totalProceeds) / exchangeRates[dateSold]
      ).toFixed(2),
    })
  );
}
