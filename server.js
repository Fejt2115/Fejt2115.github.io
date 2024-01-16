import express from 'express';
import bodyParser from 'body-parser';
import ExcelJS from 'exceljs';
import cors from 'cors';
import HyperFormula from 'hyperformula';


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
        const { nip, email, nrTelefonu, zuzycie, czasTrwaniaUmowy, grupaTaryfowa } = req.body;
        
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

        const gTC = arkusz.getCell('C6').value;
        const gTA = arkusz.getCell('I6').value;

        const cTUC = arkusz.getCell('C7').value;
        const cTUA = arkusz.getCell('I7').value;

        const zuzC = arkusz.getCell('C10').value;
        const zuzA = arkusz.getCell('I10').value;

        console.log(gTC, gTA, cTUC, cTUA, zuzC, zuzA);

        
        const tempFilePath = 'assets/excel/temp.xlsx';
        await workbook.xlsx.writeFile(tempFilePath);

        // Recalculate formulas using hyperformula
        const updatedWorkbook = await recalculateFormulas(tempFilePath);

        // Extract values after recalculation
        const EneaNettoStrefa1 = parseFloat(updatedWorkbook.getCell('C13').text) || "Błąd";
        const EneaNettoStrefa2 = parseFloat(updatedWorkbook.getCell('C14').text) || "Błąd";
        const EneaNettoStrefa3 = parseFloat(updatedWorkbook.getCell('C15').text) || "Błąd";
        const EneaOH = parseFloat(updatedWorkbook.getCell('C16').text) || "Błąd";

        const AxpoNettoStrefa1 = parseFloat(updatedWorkbook.getCell('I13').text) || "Błąd";
        const AxpoNettoStrefa2 = parseFloat(updatedWorkbook.getCell('I14').text) || "Błąd";
        const AxpoNettoStrefa3 = parseFloat(updatedWorkbook.getCell('I15').text) || "Błąd";
        const AxpoOH = parseFloat(updatedWorkbook.getCell('I16').text) || "Błąd";


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

async function recalculateFormulas(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const updatedWorkbook = await HyperFormula.evaluateWorkbook(workbook);

    return updatedWorkbook;
}