package opa.example

import data.servers
import data.networks
import data.ports

public_servers[s] {
    some i, j
    s := servers[_]
    s.ports[_] == ports[i].id
    ports[i].networks[_] == networks[j].id
    networks[j].public == true
}