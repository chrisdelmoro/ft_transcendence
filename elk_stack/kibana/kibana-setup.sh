#!/bin/bash

# Start Kibana in the background
/usr/local/bin/kibana-docker &

# Wait for Kibana to start
until curl -s -o /dev/null -w "%{http_code}" http://localhost:5601/kibana/api/status | grep -q "200"; do
  echo "Waiting for Kibana to start..."
  sleep 5
done

# Import saved objects
curl -X POST "http://localhost:5601/kibana/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  -u "${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}" \
  --form file=@/usr/share/kibana/config/kibana_index_pattern.ndjson

# Keep Kibana running in the foreground
wait
