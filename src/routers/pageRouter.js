import express from 'express';
import { html } from "#html.js";
import { formBodyParser, addDataToProps, addParamsToProps, jsonBodyParser, addBodyToProps, addBaseProps, addQueryToProps, upload } from './middlewares.js';
import fs from 'node:fs';

export const createPageRouter = (config) => {

    const router = express.Router();
    router.use(jsonBodyParser);
    router.use(formBodyParser);
    router.use(addBaseProps);
    router.use(upload.array('file'));
    router.use(addBodyToProps);
    router.use(addParamsToProps);
    router.use(addQueryToProps);

    const renderPageByUrl = route => async (req, res) => {
        let body = '';
        try {
            const sourceFolder = process.env.INIT_CWD + config.sourceFolder;
            const Page = await import(sourceFolder + route.file);
            const pageHtml = await Page.default(res.locals.props);
            const js = `<script src="/js/htmx-1.9.12.js"></script>
            <script src="/js/htmx-sse-2.0.1.js"></script>
            <script defer src="https://unpkg.com/alpinejs"></script>`;
            if (process.env.ENV === 'dev') {
                const devStyles = `<style>${fs.readFileSync(sourceFolder + config.styles, 'utf8')}</style>`;
                const content = [];
                if (req.method === 'PATCH') {
                    content.push(devStyles);
                    content.push(pageHtml);
                    body = content.join('');
                }
                else {
                    content.push(devStyles);
                    content.push(`<div hx-ext="sse" sse-connect="http://localhost:8080/reloader">
                        <div hx-patch="${res.locals.props.path}" hx-trigger="sse:message">${pageHtml}</div>
                    </div>`);
                    body = html(res.locals.props, content.join(''), js, '', Page.state);
                }
            } else {
                const styles = process.env.ENV !== 'dev' ? '<link rel="stylesheet" type="text/css" href="/output.css" />' : '';
                body = html(res.locals.props, pageHtml, js, styles, Page.state);
            }
        } catch (e) {
            if (route?.file) {
                console.log("Couldn't import route file: " + route.file + "\n Error:", e);
            }
            body = JSON.stringify(e);
        }
        res.send(body);
    };

    const renderPageByDataId = routes => async (req, res) => {
        const dataId = res.locals.props.data?.type;
        let body = '';
        const route = routes.find(route => route.type === 'data' && dataId === route.id)
        if (route) {
            try {
                const Page = await import(route.file);
                body = html(res.locals.props, await Page.default(res.locals.props));
            } catch (e) {
                body = `404`;
            }
        } else {
            body = `404`;
        }
        res.send(body);
    };


    for (const route of config.routes) {
        if (route.type === 'url') {
            router.all(route.path, [addParamsToProps, renderPageByUrl(route)]);
        }
    }

    router.all('*', [addDataToProps, renderPageByDataId(config.routes)]);

    return router;
}