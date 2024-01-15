// submit-form.js
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

// submit-form.js
app.post('/obliczenia', async (req, res) => {
    try {
        // Pobierz dane z żądania
        const { nip, email, nrTelefonu, zuzycie, czasTrwaniaUmowy, grupaTaryfowa } = req.body;
        log.console(
            nip, email, nrTelefonu, zuzycie, czasTrwaniaUmowy, grupaTaryfowa
            )
        // Wczytaj plik Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('assets/excel/kalk.xlsx');

        // Wczytaj arkusz
        const arkusz = workbook.getWorksheet("Kalkulator");

        arkusz.getCell('C6').value = { text: grupaTaryfowa };
        arkusz.getCell('I6').value = { text: grupaTaryfowa };

        arkusz.getCell('C7').value = { text: czasTrwaniaUmowy.toString() };
        arkusz.getCell('I7').value = { text: czasTrwaniaUmowy.toString() };

        arkusz.getCell('C10').value = { text: zuzycie.toString() };
        arkusz.getCell('I10').value = { text: zuzycie.toString() };

        //await workbook.commit();
        await workbook.xlsx.writeFile('assets/excel/kalk.xlsx');

        await workbook.xlsx.readFile('assets/excel/kalk.xlsx');

        const EneaNettoStrefa1 = parseFloat(arkusz.getCell('C13').text) || "Błąd";
        const EneaNettoStrefa2 = parseFloat(arkusz.getCell('C14').text) || "Błąd";
        const EneaNettoStrefa3 = parseFloat(arkusz.getCell('C15').text) || "Błąd";
        const EneaOH = parseFloat(arkusz.getCell('C16').text) || "Błąd";

        const AxpoNettoStrefa1 = parseFloat(arkusz.getCell('I13').text) || "Błąd";
        const AxpoNettoStrefa2 = parseFloat(arkusz.getCell('I14').text) || "Błąd";
        const AxpoNettoStrefa3 = parseFloat(arkusz.getCell('I15').text) || "Błąd";
        const AxpoOH = parseFloat(arkusz.getCell('I16').text) || "Błąd";


        console.log('EneaNettoStrefa1:', EneaNettoStrefa1);
        console.log('EneaNettoStrefa2:', EneaNettoStrefa2);
        console.log('EneaNettoStrefa3:', EneaNettoStrefa3);
        console.log('EneaOH:', EneaOH);

        console.log('AxpoNettoStrefa1:', AxpoNettoStrefa1);
        console.log('AxpoNettoStrefa2:', AxpoNettoStrefa2);
        console.log('AxpoNettoStrefa3:', AxpoNettoStrefa3);
        console.log('AxpoOH:', AxpoOH);
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
