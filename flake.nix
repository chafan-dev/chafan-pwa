{
  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    #nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
    #nixpkgs-23.url = "github:nixos/nixpkgs/nixos-22.05";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, nixpkgs-unstable, flake-utils}: {
    devShell.x86_64-linux =
        let
            pkgs = nixpkgs-unstable.legacyPackages.x86_64-linux;
            #pkgs_unstable = nixpkgs-unstable.legacyPackages.x86_64-linux;
        in pkgs.mkShell {
            LOCALE_ARCHIVE = if pkgs.stdenv.isLinux then "${pkgs.glibcLocales}/lib/locale/locale-archive" else "";
            buildInputs = [
            pkgs.python312
            pkgs.yarn
            pkgs.nodejs_20
            pkgs.python312Packages.distutils



            pkgs.nodePackages.serve

            pkgs.mkcert
            ];
        };
  };




}
