#!C:\Strawberry\perl\bin\perl.exe

use strict;
use warnings;
use CGI;
use DBI;
use JSON;

use constant HOME_PAGE => "../../index.html";

print CGI::header();

my $cgi = CGI->new;

#get all the request parameters...
my $date = $cgi->param("date");
my $time = $cgi->param("time");
my $description = $cgi->param("description");
my $searchText = $cgi->param("searchText");

if (not defined $searchText) {
    $searchText = "";
}

# if statement will execute if the date,time and description is defined and it will insert into the database, else statement
    # will execute if the date, time and description is not defined and it will select the list from the database with the help of SearchText
if (defined $date && defined $time && defined $description) {
    my $db = connectDb();
    createTable($db);
    my $query = $db->prepare('insert into appointments (date, time, description) values (?, ?, ?)') or die $db->errstr;
    $query->execute(
        $date,
        $time,
        $description
    ) or die $query->errstr;
    $db->disconnect;

    print "<META HTTP-EQUIV=refresh CONTENT=\"0;URL=" . HOME_PAGE . "\">\n";
}
else {
    my $db = connectDb();
    createTable($db);
    my $query = $db->prepare("select date, time, description from appointments WHERE description LIKE '%$searchText%' order by date desc;") or die $db->errstr;
    $query->execute or die $query->errstr;

    my @output;

    while (my $row = $query->fetchrow_hashref) {
        push @output, $row;
    }
    $db->disconnect;

    #return JSON
    print to_json(\@output);

}


#subroutine for database connection
sub connectDb {
    my $dbh = DBI->connect('dbi:SQLite:dbname=appointment.sqlite', '', '', { AutoCommit => 1, RaiseError => 1, PrintError => 0 })
        or die $DBI::errstr;
    return $dbh;
}

#subroutine for creating table if it doesn't exists

sub createTable {
    my ($db) = @_;
    $db->do('CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY ,date TEXT, time TEXT, description TEXT NOT NULL)');
}
