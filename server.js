import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
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
        const { zuzycie, czasTrwaniaUmowy, grupaTaryfowa } = req.body;

        // Wykonaj obliczenia bezpośrednio w kodzie
        // Zastąp ten fragment kodu własnymi obliczeniami
        const EneaNettoStrefa1 = 10; // Przykładowa wartość
        const EneaNettoStrefa2 = 20; // Przykładowa wartość
        const EneaNettoStrefa3 = 30; // Przykładowa wartość
        const EneaOH = 5; // Przykładowa wartość

        const AxpoNettoStrefa1 = 15; // Przykładowa wartość
        const AxpoNettoStrefa2 = 25; // Przykładowa wartość
        const AxpoNettoStrefa3 = 35; // Przykładowa wartość
        const AxpoOH = 8; // Przykładowa wartość

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

        // Przygotuj treść maila
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
        const mailOptions = {
            from: 'paktofonikka@gmail.com',
            to: 'fejcikk@example.com',
            subject: 'Wyniki obliczeń',
            text: mailContent
        };

        // Wyślij maila
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Błąd podczas wysyłania maila:', error);
            } else {
                console.log('Mail wysłany:', info.response);
            }
        });
    } catch (error) {
        console.error('Błąd podczas przetwarzania danych.', error.message);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
