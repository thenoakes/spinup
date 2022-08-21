import { Command, flags } from "@oclif/command";
import { spawn } from "child_process";
import { join } from "path";
import { rename, mkdir, copyFile } from "fs";
import { dir, setGracefulCleanup } from "tmp";
import { promisify } from "util";
import chalk from 'chalk';

class Spinup extends Command {
  static description = "describe the command here";

  static flags: flags.Input<{ help: void; "dir-name"?: string }> = {
    help: flags.help({ char: "h" }),
    "dir-name": flags.string({
      description:
        "Specify the directory name if it should be different to the project name",
    }),
  };

  static args = [
    {
      name: "type",
      required: true,
      description: "The type of project to create",
      options: ["node", "ts", "swift", "dart", "go", "dotnet", "oclif"],
    },
    {
      name: "name",
      required: true,
      description: "The name of the new project",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Spinup);

    /**
     * The directory to run the boostrap command from; this will either be the working directory
     * or a pre-created directory one level down
     */
    let activeDir = "";

    const bootstrap = (command: string, runFromCurrent: boolean) =>
      new Promise<void>((resolve, reject) => {
        // Run a command to bootstrap the project in a temp directory
        // If `runFromCurrent` is true, the command is expected to create the project directory itself
        // If false, the command is expected to be run in a newly-created project directory
        this.log(chalk.blue(command));
        spawn("sh", ["-c", command], {
          stdio: "inherit",
          cwd: activeDir,
        }).on("close", (_code, _signal) => {
          // Move (and potentially rename) the new project back to the working directory
          const source = runFromCurrent
            ? join(activeDir, args.name)
            : activeDir;
          const target = join(process.cwd(), flags["dir-name"] ?? args.name);
          // this.log(`mv ${source} ${target}`);
          rename(source, target, (err) => {
            if (err) {
              this.log(chalk.redBright('Something went wrong.'));
              reject(err);
            } else {
              this.log(chalk.greenBright('Project created.'));
              resolve();
            }
          });
        });
      });

    switch (args.type) {
      case "node":
        activeDir = await makeTempDir(args.name);
        await bootstrap("npm init esm -y", false);
        break;

      case "go":
        activeDir = await makeTempDir(args.name);
        await bootstrap(`go mod init github.com/thenoakes/${args.name}`, false);
        break;

      case "swift":
        activeDir = await makeTempDir(args.name);
        await bootstrap(
          `swift package init --type executable --name ${args.name}`,
          false
        );
        break;

      case "dart":
        activeDir = await makeTempDir();
        await bootstrap(`dart create -t console-full ${args.name}`, true);
        break;

      case "dotnet":
        activeDir = await makeTempDir();
        await bootstrap(`dotnet new console --name ${args.name}`, true);
        break;

      case "ts":
        activeDir = await makeTempDir();
        await bootstrap(`printf "\\n" | npx tsdx create ${args.name}`, true);
        break;

      case "oclif":
        activeDir = await makeTempDir();
        const OCLIF_EXPECT = 'oclif-generate.exp';
        await promisify(copyFile)(join(__dirname, OCLIF_EXPECT), join(activeDir, OCLIF_EXPECT));
        await bootstrap(`./${OCLIF_EXPECT} ${args.name}`, true);
        break;

      default:
        break;
    }
  }
}

const makeTempDir = async (subDir?: string) => {
  // Use tmp to create a unique temporary path
  setGracefulCleanup();
  const tempDir = await promisify(dir)();

  // Create the project directory
  if (subDir) {
    const newProjDir = join(tempDir, subDir);
    await promisify(mkdir)(newProjDir);
    return newProjDir;
  } else {
    return tempDir;
  }
};

export = Spinup;
