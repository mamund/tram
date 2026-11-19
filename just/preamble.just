# Settings every file shares: the root justfile and each module import this one.
# just does not inherit settings into a module, so without the import a module
# runs recipes with sh and no pipefail.
#
# working-directory is not set here on purpose: the root runs in the project
# directory and a module in the directory of its file, so no single value fits
# both. Use justfile_directory() for paths from the project root.
set shell := ['bash', '-eu', '-o', 'pipefail', '-c']
set positional-arguments
