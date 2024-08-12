import fs from 'node:fs';

const getModulesFromFolder = async (folderPath) => {
  const filenames = fs.readdirSync(folderPath);
  let modules = [];
  for (const filename of filenames) {
    const module = await import(folderPath + "/" + filename);
    modules.push({ ...module, id: filename.split(".")[0] });
  }
  return modules;
};
const getModulesFromRoutes = async (config) => {
  const routeFiles = config.routes.map(route => route.file)
  const sourceFolder = getSourceFolder(config);
  let modules = [];
  for (const filePath of routeFiles) {
    const module = await import(sourceFolder + filePath);
    modules.push({ ...module, id: filePath.split(".")[0] });
  }
  return modules;
};

const getApiRoutesFromModules = (modules) => {
  /** @type Record<string, ComponentRouteHandler> */
  const apiRoutes = modules.reduce(
    (
      /** @type Record<string, ComponentRouteHandler> */ result,
      /** @type Component */ current
    ) => {
      for (const apiRoute in current.api) {
        if (!current.api[apiRoute].path) {
          throw Error(`Missing path in API route ${current.id}:${apiRoute}.`);
        }
        if (!current.api[apiRoute].path.startsWith("/api/")) {
          throw Error(
            `API path doesn't start with /api/ ${current.id}:${apiRoute}. This is not allowed. API paths should always start with /api/.`
          );
        }
        if (!current.api[apiRoute].handler) {
          throw Error(
            `Missing handler in API route ${current.id}:${apiRoute}.`
          );
        }
        // Remove /api from beginning.
        result[current.api[apiRoute].path.slice(4)] = current.api[apiRoute].handler;
      }
      return result;
    },
    {}
  );
  return apiRoutes;
};

export const getApiRoutes = async (config) => {

  const sourceFolder = getSourceFolder(config);
  const components = await getModulesFromFolder(sourceFolder + config.componentFolder);
  const pages = await getModulesFromRoutes(config);
  const allModules = [...components, ...pages];
  return getApiRoutesFromModules(allModules);
};

const getSourceFolder = (config) => {
  return process.env.INIT_CWD + config.sourceFolder;
}

/**
 * Fallthrough tag for syntax highlighting and formatting.
 * @param {*} strings 
 * @param  {...any} values 
 * @returns 
 */
export const html = (strings, ...values) => {
  return String.raw({ raw: strings }, ...values);
};

/**
 * Template tag for calling function values.
 * @param {*} strings
 * @param  {...any} values
 * @returns
 */
// @ts-ignore
export const $ = (strings, ...values) => {
  let str = "";
  let i = 0;
  for (i = 0; i < values.length; i++) {
    let value = "";
    if (typeof values[i] === "function") {
      value = values[i]() || "";
    } else if (!values[i]) {
      value = "";
    } else if (typeof values[i] !== "string") {
      throw Error(
        `Value inside a template is not returning a string. ${strings[i]}${values[i]} <---`
      );
    } else {
      value = values[i];
    }
    str += strings[i] + value;
  }
  // Add the remaining string.
  str += strings[i];
  return str;
};