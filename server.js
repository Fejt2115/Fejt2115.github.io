import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import xlsx from 'xlsx';

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
        const { zuzycie, czasTrwaniaUmowy, grupaTaryfowa} = req.body;

        // Wczytaj arkusz z pliku Excel
        const workbook = xlsx.readFile(assets/excel/kalk.xlsx);
        const sheetName = 'Kalkulator'; // Podaj nazwę arkusza w pliku Excel

        setValueToCell(workbook, sheetName, 'C6', valuesToInsert.grupaTaryfowa);
        setValueToCell(workbook, sheetName, 'I6', valuesToInsert.grupaTaryfowa);

        setValueToCell(workbook, sheetName, 'C7', valuesToInsert.czasTrwaniaUmowy);
        setValueToCell(workbook, sheetName, 'I7', valuesToInsert.czasTrwaniaUmowy);

        setValueToCell(workbook, sheetName, 'C10', valuesToInsert.zuzycie);
        setValueToCell(workbook, sheetName, 'I10', valuesToInsert.zuzycie);



        
        // Pobierz wartości z komórek
        const EneaNettoStrefa1 = getValueFromCell(workbook, sheetName, 'C13');
        const EneaNettoStrefa2 = getValueFromCell(workbook, sheetName, 'C14');
        const EneaNettoStrefa3 = getValueFromCell(workbook, sheetName, 'C15');
        const EneaOH = getValueFromCell(workbook, sheetName, 'C16');

        const AxpoNettoStrefa1 = getValueFromCell(workbook, sheetName, 'I13');
        const AxpoNettoStrefa2 = getValueFromCell(workbook, sheetName, 'I14');
        const AxpoNettoStrefa3 = getValueFromCell(workbook, sheetName, 'I15');
        const AxpoOH = getValueFromCell(workbook, sheetName, 'I16');

        // Wykonaj resztę obliczeń

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

       const mailContent = `
            Enea Netto Strefa 1: ${EneaNettoStrefa1}
            Enea Netto Strefa 2: ${EneaNettoStrefa2}
            Enea Netto Strefa 3: ${EneaNettoStrefa3}
            Enea OH: ${EneaOH}

            Axpo Netto Strefa 1: ${AxpoNettoStrefa1}
            Axpo Netto Strefa 2: ${AxpoNettoStrefa2}
            Axpo Netto Strefa 3: ${AxpoNettoStrefa3}
            Axpo OH: ${AxpoOH}
        `;

        // Konfiguruj transporter mailowy
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'paktofonikka@gmail.com',
                pass: ''
            }
        });

        // Przygotuj opcje maila
        //const mailOptions = {
        //    from: 'paktofonikka@gmail.com',
        //    to: 'fejcikk@example.com',
        //    subject: 'Wyniki obliczeń',
        //    text: mailContent
        //};

        // Wyślij maila
        //transporter.sendMail(mailOptions, function (error, info) {
        //    if (error) {
        //        console.error('Błąd podczas wysyłania maila:', error);
        //    } else {
        //        console.log('Mail wysłany:', info.response);
        //    }
        //});

    } catch (error) {
        console.error('Błąd podczas przetwarzania danych.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

function getValueFromCell(workbook, sheetName, cellAddress) {
    const sheet = workbook.Sheets[sheetName];
    const cell = sheet[cellAddress];
    return cell ? cell.v : null;
}

function setValueToCell(workbook, sheetName, cellAddress, value) {
    const sheet = workbook.Sheets[sheetName];
    sheet[cellAddress] = { t: 'n', v: value, f: undefined, w: String(value) };
}


app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
