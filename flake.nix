{
  inputs = {
    # nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    yastar.url = "github:akirak/yastar";
  };

  # Set up binary cache for yastar, which is written in Rust
  nixConfig = {
    extra-substituters = [
      "https://akirak.cachix.org"
    ];
    extra-trusted-public-keys = [
      "akirak.cachix.org-1:WJrEMdV1dYyALkOdp/kAECVZ6nAODY5URN05ITFHC+M="
    ];
  };

  outputs =
    { systems, nixpkgs, ... }@inputs:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
    in
    {
      packages = eachSystem (pkgs: {
        update-database = pkgs.writeShellApplication {
          name = "update-database";
          runtimeInputs = [
            inputs.yastar.packages.${pkgs.system}.default
          ];
          text = ''
            yastar update
          '';
        };

        update-readme = pkgs.writeShellApplication {
          name = "update-readme";
          runtimeInputs = [
            pkgs.bun
            pkgs.duckdb
          ];
          text = ''
            bun install
            bun run main.ts
          '';
        };
      });

      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.bun
            pkgs.nodePackages.typescript
            pkgs.nodePackages.typescript-language-server
            pkgs.duckdb
          ];
        };
      });
    };
}
