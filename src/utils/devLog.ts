import config from "../config/config";

export const devLog = (message: string, ...optionalParams: unknown[]) => {
    if (config.environment === 'development') {
        console.log(message, ...optionalParams);
    }
};

export default devLog;
