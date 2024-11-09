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
        update-chart = pkgs.writeShellApplication {
          name = "update-star-chart";
          runtimeInputs = [
            inputs.yastar.packages.${pkgs.system}.default
            pkgs.svgcleaner
          ];
          text = ''
            tmp=generated/star-history-orig.svg
            out=generated/star-history.svg

            yastar update
            yastar chart "$tmp"
            # Optimize the SVG to normalize the stream.
            svgcleaner "$tmp" "$out"
            rm -f "$tmp"
          '';
        };

        update-readme = pkgs.writeShellApplication {
          name = "update-readme";
          runtimeInputs = [
            pkgs.bun
          ];
          text = ''
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
