import chalk from "chalk";

async function success(requestName: string, params?: any) {
  console.log(chalk.green(requestName, JSON.stringify(params)));
}

async function error(requestName: string, params?: any) {
  console.log(chalk.red(requestName, JSON.stringify(params)));
}

async function warning(requestName: string, params?: any) {
  console.log(chalk.magenta(requestName, JSON.stringify(params)));
}

async function info(requestName: string, params?: any) {
  console.log(chalk.yellowBright(requestName, JSON.stringify(params)));
}

export { success, error, warning, info };