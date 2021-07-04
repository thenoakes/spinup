import { Command, flags } from "@oclif/command";
import { spawn } from "child_process";
import { join } from "path";
import { renameSync, mkdirSync } from "fs";
import { dirSync, setGracefulCleanup } from "tmp";

class Spinup extends Command {
  static description = "describe the command here";

  static flags = {
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
      options: ["node", "ts", "swift", "dart", "go", "dotnet"],
    },
    {
      name: "name",
      required: true,
      description: "The name of the new project",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Spinup);

    this.log(
      `You want to create a ${args.type} project named ${
        args.name
      } in directory ${flags["dir-name"] ?? args.name}`
    );

    /**
     * The directory to run the boostrap command from; this will either be the working directory
     * or a pre-created directory one level down
     */
    let activeDir = "";

    const bootstrap = (command: string, runFromCurrent: boolean) => {
      spawn("sh", ["-c", command], {
        stdio: "inherit",
        cwd: activeDir,
      }).on("close", (_code, _signal) =>
        // Move (and potentially rename) the directory to the working directory
        renameSync(
          runFromCurrent ? join(activeDir, args.name) : activeDir,
          join(process.cwd(), flags["dir-name"] ?? args.name)
        )
      );
    };

    switch (args.type) {
      case "node":
        activeDir = makeTempDir(args.name);
        bootstrap("npm init esm -y", false);
        break;

      case "go":
        activeDir = makeTempDir(args.name);
        bootstrap(`go mod init github.com/thenoakes/${args.name}`, false);
        break;

      case "swift":
        activeDir = makeTempDir(args.name);
        bootstrap(
          `swift package init --type executable --name ${args.name}`,
          false
        );
        break;

      case "dart":
        activeDir = makeTempDir();
        bootstrap(`dart create -t console-full ${args.name}`, true);
        break;
      
      case "dotnet":
        activeDir = makeTempDir();
        bootstrap(`dotnet new console --name ${args.name}`, true);
        break;
      
      case "ts":
        activeDir = makeTempDir();
        bootstrap(`printf "\\n" | npx tsdx create ${args.name}`, true);
        break;
      
      default:
        break;
    }
  }
}

const makeTempDir = (subDir?: string) => {
  // Use tmp to create a unique temporary path
  setGracefulCleanup();
  const tempDir = dirSync();

  // Create the project directory
  if (subDir) {
    const newProjDir = join(tempDir.name, subDir);
    mkdirSync(newProjDir);
    return newProjDir;
  } else {
    return tempDir.name;
  }
};

export = Spinup;
