import Papa from "papaparse";

async function loadCsv(fileName) {
  const fileUrl = `${import.meta.env.BASE_URL}data/${fileName}`;

  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Could not load ${fileName}. Server returned ${response.status}.`
    );
  }

  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (results.errors.length > 0) {
    console.error(`CSV errors in ${fileName}:`, results.errors);
  }

  return results.data;
}

export default loadCsv;