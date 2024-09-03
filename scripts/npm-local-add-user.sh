/usr/bin/expect <<EOD
spawn pnpm adduser --registry=http://localhost:4873
expect {
  "Username:" {send "test\r"; exp_continue}
  "Password:" {send "test\r"; exp_continue}
  "Email: (this IS public)" {send "test@test.com\r"; exp_continue}
}
EOD
