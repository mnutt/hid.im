# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_piing.cc_session',
  :secret      => '850e41c9bab7f2ab72da9af331fc3dba8fbfbe7a9c17dbaa84ecf6f2ac5c21ffcb5fb3419850b0d2b2b8390898efa0a42c6ac0a477579861d17dc0527bba7be5'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
