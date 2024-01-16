import express from 'express';
import bodyParser from 'body-parser';
import ExcelJS from 'exceljs';
import cors from 'cors';


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

        
        arkusz.getCell('C13').calculateValue();
        const EneaNettoStrefa1 = parseFloat(arkusz.getCell('C13').text) || "Błąd";
        arkusz.getCell('C14').calculateValue();
        const EneaNettoStrefa2 = parseFloat(arkusz.getCell('C14').text) || "Błąd";
        arkusz.getCell('C15').calculateValue();
        const EneaNettoStrefa3 = parseFloat(arkusz.getCell('C15').text) || "Błąd";
        arkusz.getCell('C16').calculateValue();
        const EneaOH = parseFloat(arkusz.getCell('C16').text) || "Błąd";
        arkusz.getCell('I13').calculateValue();
        const AxpoNettoStrefa1 = parseFloat(arkusz.getCell('I13').text) || "Błąd";
        arkusz.getCell('I14').calculateValue();
        const AxpoNettoStrefa2 = parseFloat(arkusz.getCell('I14').text) || "Błąd";
        arkusz.getCell('I15').calculateValue();
        const AxpoNettoStrefa3 = parseFloat(arkusz.getCell('I15').text) || "Błąd";
        arkusz.getCell('I16').calculateValue();
        const AxpoOH = parseFloat(arkusz.getCell('I16').text) || "Błąd";


        //await workbook.xlsx.writeFile('assets/excel/kalk.xlsx');

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
