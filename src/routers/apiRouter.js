import express from 'express';
import { getApiRoutes } from '#utils.js';
import { addBaseProps, addBodyToProps, addParamsToProps, addQueryToProps, formBodyParser, jsonBodyParser } from '#routers/middlewares.js';

export const createApiRouter = async (config) => {
    const router = express.Router();
    const apiRoutes = await getApiRoutes(config);
    console.log(apiRoutes);
    router.use(jsonBodyParser);
    router.use(formBodyParser);
    router.use(addBaseProps);
    router.use(addBodyToProps);
    router.use(addQueryToProps);

    for (const route in apiRoutes) {
        router.all(route, [addParamsToProps, async (req, res) => {
            let body = `404`;
            console.log('Api route called', route, apiRoutes)
            if (apiRoutes[route]) {
                body = await apiRoutes[route](res.locals.props);
            }
            res.send(body);
        }])
    }

    return router;
}