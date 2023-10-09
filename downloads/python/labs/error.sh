#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
   tail /var/log/apache2/error_log
else
   tail /var/log/apache2/error.log
fi
