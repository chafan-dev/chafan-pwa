{
  inputs = {
    #nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    #flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs }: {
    devShell.x86_64-linux =
        let
            pkgs = nixpkgs.legacyPackages.x86_64-linux;
            #pkgs_unstable = nixpkgs-unstable.legacyPackages.x86_64-linux;
        in pkgs.mkShell {
            LOCALE_ARCHIVE = if pkgs.stdenv.isLinux then "${pkgs.glibcLocales}/lib/locale/locale-archive" else "";
            buildInputs = [
                pkgs.python312
                pkgs.yarn-berry
                    # berry 4.5.0 had trouble installing sentry/cli 2025-Feb-20
                pkgs.nodejs_22
                pkgs.python312Packages.distutils



                pkgs.nodePackages.serve

                pkgs.mkcert
            ];
        };
  };




}
