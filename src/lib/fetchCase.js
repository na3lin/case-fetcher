const { resolve } = require('path');
const DEFAULT_CONFIG_FILE_PATH = './e2e.config.js';

function handleCommand(arg, cmd) {
  let config;
  try {
    // eslint-disable-next-line
    config = require(DEFAULT_CONFIG_FILE_PATH);
  } catch (error) {
    console.error(`Unexpected import '${DEFAULT_CONFIG_FILE_PATH}' path.`);
    console.error(error);
    process.exit();
    return;
  }
  let cmdServices;
  if (arg) {
    const isCaseIDs = (/,/).test(arg);
    // eslint-disable-next-line
    const caseIDArray = arg.split(isCaseIDs ? ',' : ' ').map(e => parseInt(e));
    if (!cmd.origin) {
      cmd.origin = config.caseServices.defaultOrigin;
      console.warn(`you are using defaultOrigin --> ${config.caseServices.defaultOrigin}`);
    }
    cmdServices = { list: [{ origin: cmd.origin, caseIDs: caseIDArray }] };
  } else if (cmd.origin) {
    cmdServices = { list: [{ origin: cmd.origin }] };
  } else {
    try {
      cmdServices = JSON.parse(cmd.service);
    } catch (error) {
      throw error;
    }
  }

  const {
    originField, handlerField, projectIdField, ulField
  } = config.caseServices;
  const configServicesList = config.caseServices.list.map(item => ({
    ...item,
    origin: item[originField || 'origin'],
    handler: item[handlerField || 'handler'],
    projectId: item[projectIdField || 'projectId'],
    ul: item[ulField || 'ul']
  }));
  const cmdServicesList = cmdServices.list;
  cmdServicesList.forEach((cmdService, index) => {
    const length = configServicesList.length;
    for (let i = 0; i < length; i += 1) {
      if (cmdService.origin === configServicesList[i].origin) {
        cmdServicesList[index] = { ...configServicesList[i], ...cmdService };
        break;
      }
    }
  });
  return cmdServicesList;
}

const create = async (input, cmd) => {
  const cmdServicesList = handleCommand(input, cmd);
  let Services;
  for (const {
    handler, caseIDs, featuresPath, ...params
  } of cmdServicesList) {
    try {
      // eslint-disable-next-line
      const servicesModule = require(resolve(process.cwd(), handler));
      Services = (servicesModule && servicesModule.__esModule) ?
        servicesModule.default :
        servicesModule;
    } catch (error) {
      throw error;
    }
    const services = new Services(params);
    if (!featuresPath || featuresPath === '') {
      console.error(`Please enter featuresPath in ${configPath}`);
      process.exit();
      return;
    }

    for (const id of caseIDs) {
      await services.createCaseTemplate(id, featuresPath);
    }
  }
};

const update = async (input, cmd) => {
  const cmdServicesList = handleCommand(input, cmd);
  let Services;
  for (const {
    handler, caseIDs, featuresPath, ...params
  } of cmdServicesList) {
    try {
      // eslint-disable-next-line
      const servicesModule = require(resolve(process.cwd(), handler));
      Services = (servicesModule && servicesModule.__esModule) ?
        servicesModule.default :
        servicesModule;
    } catch (error) {
      throw error;
    }
    const services = new Services(params);
    if (!featuresPath || featuresPath === '') {
      console.error(`Please enter featuresPath in ${configPath}`);
      process.exit();
      return;
    }

    for (const id of caseIDs) {
      await services.updateCaseTemplate(id, featuresPath);
    }
  }
};

const mkdir = async (cmd) => {
  const cmdServicesList = handleCommand('', cmd);
  let Services;
  for (const {
    handler, featuresPath, ...params
  } of cmdServicesList) {
    try {
      // eslint-disable-next-line
      const servicesModule = require(resolve(process.cwd(), handler));
      Services = (servicesModule && servicesModule.__esModule) ?
        servicesModule.default :
        servicesModule;
    } catch (error) {
      throw error;
    }
    const services = new Services(params);
    if (!featuresPath || featuresPath === '') {
      console.error(`Please enter featuresPath in ${configPath}`);
      process.exit();
      return;
    }
    await services.createAllDirectory(featuresPath);
  }
};

module.exports = {
  create,
  update,
  mkdir
};
