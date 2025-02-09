# wrangler.json file configuration
 ``` 
 "compatibility_flags": [
    "nodejs_compat"
  ],
  "vars": {
    "MY_VAR": "my-variable"
  },
  "kv_namespaces": [
    {
      "binding": "MY_KV_NAMESPACE",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket"
    }
  ],
  "d1_databases": [
    {
      "binding": "MY_DB",
      "database_name": "my-database",
      "database_id": ""
    }
  ],
  "ai": {
    "binding": "AI"
  },
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  }
  ```