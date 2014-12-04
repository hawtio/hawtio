
SCRIPT_DIR="$(dirname $(readlink -f $0))"

echo "Script in $SCRIPT_DIR"

SCRIPT_PATHS=

for each in $SCRIPT_DIR/node_modules/*
do
  if [ -d "$each/bin" ]
  then
    if [ -z "$SCRIPT_PATHS" ]
    then
      SCRIPT_PATHS=$each/bin
    else
      SCRIPT_PATHS=$SCRIPT_PATHS:$each/bin
    fi
  fi
done

echo "Setting PATH to $SCRIPT_PATHS:$PATH"

export PATH=$SCRIPT_PATHS:$PATH


