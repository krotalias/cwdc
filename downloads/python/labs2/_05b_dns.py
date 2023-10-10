#!/usr/bin/env python
#
## @package _05b_dns
#
#  Execute the reverse DNS of the given IP.
#
#  @author Paulo Roma
#  @since  25/07/2009
#  @see http://www.dnspython.org/

import sys
import dns.resolver
import dns.reversename
from tkinter import *

def reverseDns(IP, ldns):
    """Execute the reverse DNS of the given IP."""

    try:
        d = dns.resolver.resolve(dns.reversename.from_address(IP), 'PTR')
    except AttributeError:  # python 2
        d = dns.resolver.query(dns.reversename.from_address(IP), 'PTR')
    except dns.resolver.NXDOMAIN:
        return False

    for a in d:
        ldns.append(a)
    return True

def main(argv=None):
    """Main Program."""

    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        address = "216.239.32.10"
    else:
        address = argv[1]

    ladd = address.split(".")
    ldns = []

    def doDNS():
        """Assembles the address and query the reverse DNS."""

        address = e1.get() + "." + e2.get() + "." + e3.get() + "." + e4.get()
        text.delete(0.0, END)
        if reverseDns(address, ldns):
            for i in ldns:
                text.insert(END, str(i) + "\n", 'color')
        else:
            text.insert(END, "Invalid Domain\n")

    def clear():
        """Clears the text area and deletes ldns."""

        text.delete(0.0, END)
        del ldns[:]

    root = Tk()
    root.title('Reverse DNS')
    root.geometry('+0+0')
    root.resizable(False, False)
    text = Text(root, height=5, width=60)
    scroll = Scrollbar(root, command=text.yview)

    text.configure(yscrollcommand=scroll.set)

    text.tag_configure('bold_italics', font=('Verdana', 12, 'bold', 'italic'))

    text.tag_configure('big', font=('Verdana', 24, 'bold'))

    text.tag_configure('color', foreground='blue',
                       font=('Tempus Sans ITC', 14))

    text.tag_configure('groove', relief=GROOVE, borderwidth=2)

    top = Frame()
    top.pack()
    bot = Frame()
    bot.pack()

    e1 = Entry(top, font="Arial 24", width=3)
    e1.insert(0, ladd[0])
    e1.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e2 = Entry(top, font="Arial 24", width=3)
    e2.insert(0, ladd[1])
    e2.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e3 = Entry(top, font="Arial 24", width=3)
    e3.insert(0, ladd[2])
    e3.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e4 = Entry(top, font="Arial 24", width=3)
    e4.insert(0, ladd[3])
    e4.pack(side="left")

    Button(bot, text="Reverse DNS", command=doDNS).pack(side="left")
    Button(bot, text="Clear", command=clear).pack(side="right")

    text.pack(side=LEFT)
    scroll.pack(side=RIGHT, fill=Y)

    root.mainloop()


if __name__ == "__main__":
    sys.exit(main())
