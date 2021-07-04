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

    let projectDir = "";
    switch (args.type) {
      case "node":
        projectDir = makeTempDir(args.name);

        // In the project directory, call `npm init`
        spawn("npm", ["init", "esm", "-y"], {
          stdio: "inherit",
          cwd: projectDir,
        }).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            projectDir,
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
        break;
      case "go":
        projectDir = makeTempDir(args.name);

        spawn("go", ["mod", "init", `github.com/thenoakes/${args.name}`], {
          stdio: "inherit",
          cwd: projectDir,
        }).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            projectDir,
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
        break;
      case "swift":
        projectDir = makeTempDir(args.name);

        spawn(
          "swift",
          ["package", "init", "--type", "executable", "--name", args.name],
          {
            stdio: "inherit",
            cwd: projectDir,
          }
        ).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            projectDir,
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
        break;
      case "dart":
        projectDir = makeTempDir();

        spawn("dart", ["create", "-t", "console-full", args.name], {
          stdio: "inherit",
          cwd: projectDir,
        }).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            join(projectDir, args.name),
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
        break;
      case "dotnet":
        projectDir = makeTempDir();

        spawn("dotnet", ["new", "console", "--name", args.name], {
          stdio: "inherit",
          cwd: projectDir,
        }).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            join(projectDir, args.name),
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
      // case "ts":
      //   projectDir = makeTempDir();

      //   spawn("npx", ["tsdx", "create", args.name], {
      //     stdio: "inherit",
      //     cwd: projectDir,
      //   }).on("close", (_code, _signal) =>
      //     // Move (and potentially rename) the directory to the working directory
      //     renameSync(
      //       join(projectDir, args.name),
      //       join(process.cwd(), flags["dir-name"] ?? args.name)
      //     )
      //   );
      //   break;
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
