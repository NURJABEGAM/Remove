const { Spleeter } = require('node-spleeter');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const form = new formidable.IncomingForm();
    const uploadDir = '/tmp/';

    return new Promise((resolve, reject) => {
        form.uploadDir = uploadDir;
        form.keepExtensions = true;

        form.parse(event, (err, fields, files) => {
            if (err) {
                reject({
                    statusCode: 500,
                    body: 'Error parsing the files',
                });
                return;
            }

            const filePath = files.file.path;
            const spleeter = new Spleeter();

            spleeter.separate(filePath, uploadDir).then(outputPaths => {
                const vocalsPath = outputPaths[0];
                const accompanimentPath = outputPaths[1];

                const vocalsUrl = `/tmp/${path.basename(vocalsPath)}`;
                const accompanimentUrl = `/tmp/${path.basename(accompanimentPath)}`;

                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        vocals: vocalsUrl,
                        accompaniment: accompanimentUrl
                    }),
                });
            }).catch(err => {
                reject({
                    statusCode: 500,
                    body: 'Error processing the audio file',
                });
            });
        });
    });
};
