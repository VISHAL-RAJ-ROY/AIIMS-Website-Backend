const express = require('express');

var bp = require('body-parser');
// var cors = require('cors');

const app = express();

var helper = require('sendgrid').mail;
const async = require('async');

function sendEmail(
    parentCallback,
    fromEmail,
    toEmails,
    subject,
    textContent,
    htmlContent
  ) {
    const errorEmails = [];
    const successfulEmails = [];
const sg = require('sendgrid')('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');
async.parallel([
      function(callback) {
        // Add to emails
        for (let i = 0; i < toEmails.length; i += 1) {
          // Add from emails
          const senderEmail = new helper.Email(fromEmail);
          // Add to email
          const toEmail = new helper.Email(toEmails[i]);
          // HTML Content
          const content = new helper.Content('text/html', htmlContent);
          const mail = new helper.Mail(senderEmail, subject, toEmail, content);
          var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
          });
          sg.API(request, function (error, response) {
            console.log('SendGrid');
            if (error) {
              console.log('Error response received');
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
          });
        }
        // return
        callback(null, true);
      }
    ], function(err, results) {
      console.log('Done');
    });
    parentCallback(null,
      {
        successfulEmails: successfulEmails,
        errorEmails: errorEmails,
      }
    );
}

// var whitelist = ['http://localhost:3000,http://localhost:5000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(bp());
// app.use(cors());
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

app.get('/api/customers', (req,res) => {
    const customers = [
        {id: 1, name : 'John' }
    ];
    res.json(customers);
});

// app.post('/api/sendmail', (req,res) => {
//     res.send('hellololo');
// })

app.post('/api/sendmail', function (req, res, next) {
    async.parallel([
      function (callback) {
        sendEmail(
          callback,
          'mevishal2000@gmail.com',
          ['mevishal2000@gmail.com'],
          'Subject Line',
          'Text Content',
          '<p style="font-size: 32px;">HTML Content</p>'
        );
      }
    ], function(err, results) {
      res.send({
        success: true,
        message: 'Emails sent',
        successfulEmails: results[0].successfulEmails,
        errorEmails: results[0].errorEmails,
      });
    });
 });

const port = 5000;

app.listen(port, ()=> console.log('Server started on port ${port}'));