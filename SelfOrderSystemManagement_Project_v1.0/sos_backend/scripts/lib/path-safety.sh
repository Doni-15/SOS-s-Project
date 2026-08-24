#!/usr/bin/env bash

require_no_control_characters() {
  local value="${1:-}"
  local label="${2:-value}"

  case "$value" in
    *$'\n'*|*$'\r'*|*$'\t'*)
      echo "$label must not contain control characters" >&2
      return 1
      ;;
  esac
}

require_safe_backup_name() {
  local name="${1:-}"

  require_no_control_characters "$name" "BACKUP_NAME"

  if [[ ! "$name" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
    echo "BACKUP_NAME may only contain letters, digits, dot, underscore, and hyphen" >&2
    return 1
  fi
}

require_safe_image_reference() {
  local image="${1:-}"

  require_no_control_characters "$image" "POSTGRES_DOCKER_IMAGE"

  if [[ ! "$image" =~ ^[A-Za-z0-9][A-Za-z0-9._/@:-]*$ ]]; then
    echo "POSTGRES_DOCKER_IMAGE is not a valid image reference" >&2
    return 1
  fi
}

canonical_existing_file() {
  local input="${1:-}"
  local directory
  local file_name

  require_no_control_characters "$input" "Backup path"

  if [ -z "$input" ] || [ ! -f "$input" ]; then
    echo "Backup file not found: $input" >&2
    return 1
  fi

  directory="$(dirname -- "$input")"
  file_name="$(basename -- "$input")"

  if [ -z "$file_name" ] || [ "$file_name" = "." ] || [ "$file_name" = ".." ]; then
    echo "Backup path must identify a regular file" >&2
    return 1
  fi

  directory="$(cd -- "$directory" && pwd -P)"
  printf '%s/%s\n' "$directory" "$file_name"
}

canonical_non_root_directory() {
  local input="${1:-}"
  local directory

  require_no_control_characters "$input" "Directory path"

  if [ -z "$input" ]; then
    echo "Directory path is required" >&2
    return 1
  fi

  mkdir -p -- "$input"
  directory="$(cd -- "$input" && pwd -P)"

  if [ "$directory" = "/" ]; then
    echo "Refusing to use the filesystem root as a backup or restore directory" >&2
    return 1
  fi

  printf '%s\n' "$directory"
}
