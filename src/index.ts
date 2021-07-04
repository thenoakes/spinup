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

    switch (args.type) {
      case "node":
        // Use tmp to create a unique temporary path
        setGracefulCleanup();
        const tempDir = dirSync();

        // Create the project directory
        const newProjDir = join(tempDir.name, args.name);
        mkdirSync(newProjDir);

        // In the project directory, call `npm init`
        spawn("npm", ["init", "esm", "-y"], {
          stdio: "inherit",
          cwd: newProjDir,
        }).on("close", (_code, _signal) =>
          // Move (and potentially rename) the directory to the working directory
          renameSync(
            newProjDir,
            join(process.cwd(), flags["dir-name"] ?? args.name)
          )
        );
        break;
      default:
        break;
    }
  }
}

// const renamePackageJson = (path: string, newName: string) => {
//   const pJson = JSON.parse(readFileSync(join(path, "package.json"), "utf8"));
//   pJson.name = newName;
//   writeFileSync(join(path, "package.json"), JSON.stringify(pJson, null, 2));

// }

export = Spinup;
