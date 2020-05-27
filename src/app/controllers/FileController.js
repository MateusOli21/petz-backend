const File = require('../models/File');

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const { url, id } = await File.create({ name, path });

    return res.status(200).json({ id, name, path, url });
  }
}

module.exports = new FileController();
