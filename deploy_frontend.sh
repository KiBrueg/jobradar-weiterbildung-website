#!/bin/bash
# Run after npm run build + scp of dist/ to fix nginx permissions
chmod -R o+rX /home/kirill/jobradar-weiterbildung-website/dist/
echo 'Permissions fixed for nginx'
