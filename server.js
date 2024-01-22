import express from 'express';
import bodyParser from 'body-parser';
import ExcelJS from 'exceljs';
import cors from 'cors';
import hyperformula from 'hyperformula';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/obliczenia', (req, res) => {
    res.send('To jest ścieżka GET /obliczenia. Wysyłaj zapytania POST, aby przetworzyć dane.');
});

app.post('/obliczenia', async (req, res) => {
    try {
        // Pobierz dane z żądania
        const { zuzycie, czasTrwaniaUmowy, grupaTaryfowa } = req.body;

        // Wczytaj plik Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('assets/excel/kalk.xlsx');

        // Wczytaj arkusz
        const arkusz = workbook.getWorksheet("Kalkulator");

        arkusz.getCell('C6').value = grupaTaryfowa;
        arkusz.getCell('I6').value = grupaTaryfowa;

        arkusz.getCell('C7').value = czasTrwaniaUmowy;
        arkusz.getCell('I7').value = czasTrwaniaUmowy;

        arkusz.getCell('C10').value = zuzycie;
        arkusz.getCell('I10').value = zuzycie;

        // Stwórz instancję HyperFormula
        const hfInstance = hyperformula.buildFromSheets({});

        // Oblicz wartości komórek za pomocą HyperFormula
        const formulaCellAddresses = ['C13', 'C14', 'C15', 'C16', 'I13', 'I14', 'I15', 'I16'];

        formulaCellAddresses.forEach(cellAddress => {
            hfInstance.calculateFormula(arkusz.getCell(cellAddress).formula, arkusz.id);
        });

        const tempFilePath = 'assets/excel/temp.xlsx';
        await workbook.xlsx.writeFile(tempFilePath);

        // Extract values after recalculation
        const EneaNettoStrefa1 = parseFloat(arkusz.getCell('C13').text) || "Błąd";
        const EneaNettoStrefa2 = parseFloat(arkusz.getCell('C14').text) || "Błąd";
        const EneaNettoStrefa3 = parseFloat(arkusz.getCell('C15').text) || "Błąd";
        const EneaOH = parseFloat(arkusz.getCell('C16').text) || "Błąd";

        const AxpoNettoStrefa1 = parseFloat(arkusz.getCell('I13').text) || "Błąd";
        const AxpoNettoStrefa2 = parseFloat(arkusz.getCell('I14').text) || "Błąd";
        const AxpoNettoStrefa3 = parseFloat(arkusz.getCell('I15').text) || "Błąd";
        const AxpoOH = parseFloat(arkusz.getCell('I16').text) || "Błąd";

        // Odpowiedz klientowi
        res.json({
            EneaNettoStrefa1,
            EneaNettoStrefa2,
            EneaNettoStrefa3,
            EneaOH,
            AxpoNettoStrefa1,
            AxpoNettoStrefa2,
            AxpoNettoStrefa3,
            AxpoOH
        });
    } catch (error) {
        console.error('Błąd podczas przetwarzania danych.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.listen(port, () => {
    console.log(`Serwer działa na https://przelicznik.onrender.com:${port}`);
});