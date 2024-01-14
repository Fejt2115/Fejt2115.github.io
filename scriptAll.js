// Importuj wymagane biblioteki
const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

// Stwórz instancję aplikacji Express
const app = express();

// Middleware do obsługi danych JSON
app.use(bodyParser.json());

// Endpoint dla przesyłania formularza
app.post('/submit-form', async (req, res) => {
  try {
    // Dane z formularza
    const formData = req.body;

    // Ścieżka do gotowego arkusza Excela
    const excelFilePath = 'kalk.xlsx';

    // Wczytaj istniejący arkusz Excela
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);

    // Wybierz odpowiednią stronę (worksheet)
    const worksheet = workbook.getWorksheet('Kalkulator');

    // Wstaw dane z formularza do odpowiednich komórek
    worksheet.getCell('C10').value = formData.zuzycie;
    worksheet.getCell('C7').value = formData.czasTrwaniaUmowy;
    worksheet.getCell('C6').value = formData.grupaTaryfowa;

    // Zapisz zmiany z powrotem do pliku
    await workbook.xlsx.writeFile(excelFilePath);

    // Wyślij e-mail z potwierdzeniem
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'twoj.email@gmail.com',
        pass: 'twoje_haslo'
      }
    });

    const mailOptions = {
      from: 'twoj.email@gmail.com',
      to: 'adres.firmowy@example.com',
      subject: 'Nowe dane z formularza',
      text: 'Nowe dane z formularza:\n\n' + JSON.stringify(formData, null, 2)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail wysłany: ' + info.response);
      }
    });

    // Odpowiedź dla klienta
    res.status(200).json({ message: 'Dane z formularza odebrane pomyślnie.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas przetwarzania danych.' });
  }
});

// Uruchom serwer
const port = 3000;
app.listen(port, () => console.log(`Serwer nasłuchuje na porcie ${port}`));
