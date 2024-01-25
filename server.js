import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import xlsx from 'xlsx';
import { Parser as FormulaParser } from 'hot-formula-parser';

var parser = new FormulaParser();
let formulla;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());



function getCalculatedValue(workbook, sheetName, cellAddress) {
    const sheet = workbook.Sheets[sheetName];
    const cell = sheet[cellAddress];
    const formula = cell.f;
    const result = parser.parse(formula);
    return result.result;
}

function setValueToCell(workbook, sheetName, cellAddress, value) {
    const sheet = workbook.Sheets[sheetName];
    sheet[cellAddress] = { t: 'n', v: value, f: undefined, w: String(value) };
}


app.get('/obliczenia', (req, res) => {
    res.send('To jest ścieżka GET /obliczenia. Wysyłaj zapytania POST, aby przetworzyć dane.');
});

app.post('/obliczenia', async (req, res) => {
    try {
        // Pobierz dane z żądania
        const { zuzycie, czasTrwaniaUmowy, grupaTaryfowa} = req.body;

        // Wczytaj arkusz z pliku Excel
        const workbook = xlsx.readFile('./assets/excel/kalk.xlsx');
        const sheetName = 'Kalkulator'; // Podaj nazwę arkusza w pliku Excel

        setValueToCell(workbook, sheetName, 'C6', grupaTaryfowa);
        setValueToCell(workbook, sheetName, 'I6', grupaTaryfowa);

        setValueToCell(workbook, sheetName, 'C7', czasTrwaniaUmowy);
        setValueToCell(workbook, sheetName, 'I7', czasTrwaniaUmowy);

        setValueToCell(workbook, sheetName, 'C10', zuzycie);
        setValueToCell(workbook, sheetName, 'I10', zuzycie);

        
        // zrekalkuluj wszystkie inne
        formulla = workbook.Sheets[sheetName]['D13'].f;
        setValueToCell(workbook, sheetName, 'D13', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['E13'].f;
        setValueToCell(workbook, sheetName, 'E13', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['F13'].f;
        setValueToCell(workbook, sheetName, 'F13', parser.parse(formulla).result);

        formulla = workbook.Sheets[sheetName]['D14'].f;
        setValueToCell(workbook, sheetName, 'D14', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['E14'].f;
        setValueToCell(workbook, sheetName, 'E14', parser.parse(formulla).result);

        formulla = workbook.Sheets[sheetName]['D15'].f;
        setValueToCell(workbook, sheetName, 'D15', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['E15'].f;
        setValueToCell(workbook, sheetName, 'E15', parser.parse(formulla).result);


        formulla = workbook.Sheets[sheetName]['J13'].f;
        setValueToCell(workbook, sheetName, 'J13', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['K13'].f;
        setValueToCell(workbook, sheetName, 'K13', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['L13'].f;
        setValueToCell(workbook, sheetName, 'L13', parser.parse(formulla).result);

        formulla = workbook.Sheets[sheetName]['J14'].f;
        setValueToCell(workbook, sheetName, 'J14', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['K14'].f;
        setValueToCell(workbook, sheetName, 'K14', parser.parse(formulla).result);

        formulla = workbook.Sheets[sheetName]['J15'].f;
        setValueToCell(workbook, sheetName, 'J15', parser.parse(formulla).result);
        formulla = workbook.Sheets[sheetName]['K15'].f;
        setValueToCell(workbook, sheetName, 'K15', parser.parse(formulla).result);

        
        //Pobierz wartości z komórek
        const EneaNettoStrefa1 = getCalculatedValue(workbook, sheetName, 'C13');
        const EneaNettoStrefa2 = getCalculatedValue(workbook, sheetName, 'C14');
        const EneaNettoStrefa3 = getCalculatedValue(workbook, sheetName, 'C15');
        const EneaOH = getCalculatedValue(workbook, sheetName, 'C16');

        const AxpoNettoStrefa1 = getCalculatedValue(workbook, sheetName, 'I13');
        const AxpoNettoStrefa2 = getCalculatedValue(workbook, sheetName, 'I14');
        const AxpoNettoStrefa3 = getCalculatedValue(workbook, sheetName, 'I15');
        const AxpoOH = getCalculatedValue(workbook, sheetName, 'I16');

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

        
    } catch (error) {
        console.error('Błąd podczas przetwarzania danych.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.post('/wyslij-mail', async (req, res) => {
    try {
        const { nip, email, nrTelefonu, zuzycie, czasTrwaniaUmowy, grupaTaryfowa, wynikiObliczen} = req.body;

        // Przygotuj opcje maila
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'abby.rath@ethereal.email',
                pass: 'JPbcsywyUfZRfAAdCe'
            }
        });

        const mailOptions = {
            from: 'fejcikk@gmail.com',
            to: 'mszoltyski@gmail.com',
            subject: 'Obliczenie wyników',
            text: `Treść wiadomości:
            \nNIP: "${nip}"\nNumer telefonu: "${nrTelefonu}"\nEmail: "${email}"
            \nZużycie: "${zuzycie}"\nCzas Trwania Umowy: "${czasTrwaniaUmowy}"\nGrupa Taryfowa: "${grupaTaryfowa}"
            \nWyniki obliczeń: ${wynikiObliczen ? JSON.stringify(wynikiObliczen, null, 2) : 'Brak wyników obliczeń'}`
        };
        
        // Wyślij maila
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Błąd podczas wysyłania maila:', error);
                res.status(500).json({ error: 'Błąd serwera podczas wysyłania maila' });
            } else {
                console.log('Mail wysłany:', info.response);
                res.json({ message: 'Mail wysłany pomyślnie' });
            }
        });

    } catch (error) {
        console.error('Błąd podczas przetwarzania danych do wysłania maila.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.get('/wyslij-mail', (req, res) => {
    res.send('To jest ścieżka GET /obliczenia. Wysyłaj zapytania POST, aby przetworzyć dane.');
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
