import chalk from "chalk";

const log = console.log

export const logMessage = (message: string): void => {
    log(chalk.blue(message));
}

export const logSuccess = (message: string): void => {
    log(chalk.green(message));
}

export const logError = (message: string): void => {
    log(chalk.red(message));
}