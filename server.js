import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import xlsx from 'xlsx';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

function getValueFromCell(workbook, sheetName, cellAddress) {
    const sheet = workbook.Sheets[sheetName];
    const cell = sheet[cellAddress];
    return cell ? cell.v : null;
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

        
    } catch (error) {
        console.error('Błąd podczas przetwarzania danych.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.post('/wyslij-mail', async (req, res) => {
    try {
        const { nip, email, nrTelefonu, zuzycie, czasTrwaniaUmowy, grupaTaryfowa} = req.body;

        // Przygotuj opcje maila
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'twoj-email@gmail.com',  // Podaj swój adres e-mail
                pass: 'twoje-haslo',           // Podaj swoje hasło
            },
        });

        const mailOptions = {
            from: 'twoj-email@gmail.com',
            to: 'mszoltyski@gmail.com',
            subject: 'Obliczenie wyników',
            text: `Treść wiadomości:\nNIP: "${nip}"\nNumer telefonu: "${nrTelefonu}"
                \nEmail: "${email}"\nZużycie: "${zuzycie}"\nCzas Trwania Umowy: "${czasTrwaniaUmowy}"
                \nGrupa Taryfowa: "${grupaTaryfowa}"`
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
