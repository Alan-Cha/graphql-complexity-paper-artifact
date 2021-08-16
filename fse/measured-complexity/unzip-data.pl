#!/usr/bin/env perl

# Imports

use strict;
use warnings;

# Globals

my $tarball = "data.tgz";
my $destination = "data";

# Sanity checks

if (-d $destination) {
	print "Destination directory $destination exists already\n";
	exit 1;
}

if (not -f $tarball) {
  print "Could not find data tarball $tarball\n";
  exit 1;
}

# Here we go

&runcmd("tar -xzvf $tarball");

###############################
# Helpers
###############################

sub runcmd {
	my ($cmd) = @_;
	print "CMD: $cmd\n";
	system($cmd);
}
