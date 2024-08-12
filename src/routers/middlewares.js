import bodyParser from 'body-parser';
import multer from 'multer';

export const jsonBodyParser = bodyParser.json()
export const formBodyParser = bodyParser.urlencoded({ extended: true, limit: '10000kb' })

// Set up storage for uploaded files
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const memoryStorage = multer.memoryStorage();

// Create the multer instance
export const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
});

export const addBaseProps = async (req, res, next) => {
    res.locals.props = {
        method: req.method,
        path: req.originalUrl,
        meta: { title: "Testisivu" }
    };
    next()
}

export const addBodyToProps = async (req, res, next) => {
    if (req.method !== 'GET') {
        let files = [];
        if (req.file) {
            files = [{ name: req.file.originalname, mime: req.file.mimetype, data: req.file.buffer.toString("base64") }]
        }
        if (req.files) {
            files = req.files.map(file => {
                return { name: file.originalname, mime: file.mimetype, data: file.buffer.toString("base64") }
            })
        }
        res.locals.props.body = { ...req.body, files };
    }
    next()
}


export const addQueryToProps = async (req, res, next) => {
    res.locals.props.query = req.query;
    next()
}

export const addParamsToProps = async (req, res, next) => {
    res.locals.props.params = req.params;
    next()
}

export const addDataToProps = async (req, res, next) => {
    // Idea of this is to add data from database connected to this requests url.
    // TODO user to add own middlewares to handle this. Maximum flexibility!
    //res.locals.props.data = await getRoute(req.originalUrl);
    next()
}