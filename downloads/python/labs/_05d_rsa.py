#!/usr/bin/env python
#  coding: UTF-8
#
## @namespace _05d_rsa
#
#   An RSA algorithm for public-key cryptography.
#
#   The RSA algorithm is named after Ron Rivest, Adi Shamir and Len Adleman,
#   who invented it in 1977. The basic technique was first discovered
#   in 1973 by Clifford Cocks of CESG (part of the British GCHQ),
#   but this was a secret until 1997. The patent taken out by RSA Labs has expired.
#   <p>
#   The RSA cryptosystem is the most widely-used public key cryptography
#   algorithm in the world. It can be used to encrypt a message without the need
#   to exchange a secret key separately.
#   <p>
#   The RSA algorithm can be used for both public key encryption and digital signatures.
#   Its security is based on the difficulty of factoring large integers.
#
#   Summary of RSA
#
#    1. n = pq, where p and q are distinct primes.
#    2. phi, @f$ \varphi = (p-1)(q-1)@f$
#    3. e < n such that gcd(e, phi)=1
#    4. d = @f$e^{-1}@f$ mod phi.
#    5. c = @f$m^{e}@f$ mod n, 1 < m < n.
#    6. m = @f$c^{d}@f$ mod n.
#
#   @author Paulo Roma
#   @since 19/02/2012
#   @see http://www.di-mgt.com.au/rsa_alg.html
#

import sys

##
#   @brief The extended Euclidean algorithm for the Greatest Common Divisor of two integers.
#   @param a first integer
#   @param b second integer.
#   @return The tuple (x, y, gcd(a, b))
#           where x and y satisfy the equation ax + by = gcd(a, b)
#
def egcd(a, b):
    x = 0
    lastx = 1
    y = 1
    lasty = 0

    while b:
        quotient = a // b      # integer division
        (a, b) = (b, a % b)
        (x, lastx) = (lastx - quotient * x, x)
        (y, lasty) = (lasty - quotient * y, y)

    return (lastx, lasty, a)

##
#   @brief Calculates the modular inverse of an integer.
#   d * a = 1 mod m
#
#   @param a given integer.
#   @param m divisor.
#   @return modular inverse d, or 0 if the modular inverse does not exist.
#
def modinv(a, m):
    x, y, g = egcd(a, m)
    if g != 1:
        return 0  # None: modular inverse does not exist
    else:
        return x % m

##
#   @brief Calculates the modular inverse of an integer.
#   d * a = c mod b
#
#   @param a given integer.
#   @param b divisor.
#   @param c generally 1.
#   @return modular inverse d, or 0 if the modular inverse does not exist.
#
def modinv2(a, b, c):
    r = b % a

    if (r == 0):
        return (c // a) % (b // a)

    return (modinv2(r, a, -c) * b + c) // a % b

##
#   @brief Calculates c to the power of d mod n.
#
#   @param c base.
#   @param d exponent.
#   @param n divisor.
#   @return @f$c^d\ \%\ n@f$
#
def power_mod_n(c, d, n):
    r = c % n
    l = []

    while d > 1:
        l.append(d & 1)
        d = d >> 1
    while l:
        v = l.pop()  # get the bits of d in reversed order
        if (v):
            e = c
        else:
            e = 1
        r = (e * r * r) % n

    if c < 0:
        r -= n

    return r

##
#   @brief Generates the public and private keys.
#   In practice, common choices for e are 3, 17 and 65537 @f$(2^{16}+1)@f$.
#   These are Fermat primes, sometimes referred to as @f$F_0, F_2@f$ and @f$F_4@f$ respectively @f$(F_x=2^{2^x}+1)@f$.
#   They are chosen because they make the modular exponentiation operation faster.
#   <p>
#   Also, having chosen e, it is simpler to test whether gcd(e, p-1)=1 and gcd(e, q-1)=1
#   while generating and testing the primes p and q.
#   Values of p or q that fail this test can be rejected there and then.
#   <p>
#   (Even better: if e is prime and greater than 2 then you can do the less-expensive test:
#                 (p mod e)!=1 instead of gcd(p-1,e)==1.)
#   @param p a big prime number.
#   @param q another prime number.
#   @return (n, d, e, phi) or p*q, private key (n,d), public key (n,e), (p-1)*(q-1).
#
def generateKeys(p, q):
    e = 17
    n = p * q
    phi = (p - 1) * (q - 1)
    d = modinv(e, phi)               # modinv2(e,phi,1)
    if not d:
        raise ValueError(
            "modular inverse does not exist: gcd(%d,%d) is not 1" % (e, phi))

    return (n, d, e, phi)

def main():
    argv = sys.argv

    if len(argv) < 4:
        print(
            'usage: %s <number1> <number2> <prime size(small,medium,large)>' % (argv[0]))
        sys.exit(1)

    try:
        a = int(argv[1])
        b = int(argv[2])
        type = argv[3]
    except (TypeError, ValueError):
        print(
            'usage: %s <number1> <number2> <prime size(small,medium,large)>' % (argv[0]))
        sys.exit(1)

    (x, y, gcd) = egcd(a, b)
    print('The GCD of %d and %d is %d' % (a, b, gcd))
    print('%d * %d + %d * %d = %d' % (a, x, b, y, gcd))
    print('The modular inverse of %d and %d is %d' % (a, b, modinv(a, b)))

    if type == "small":
        p = 131
        q = 139
    elif type == "medium":
        p = 19394651
        q = 19395031
    else:
        # 100 digit primes: http://primes.utm.edu/lists/small/small.html
        p = 5371393606024775251256550436773565977406724269152942136415762782810562554131599074907426010737503501
        q = 2908511952812557872434704820397229928450530253990158990550731991011846571635621025786879881561814989

    try:
        n, d, e, phi = generateKeys(p, q)
    except (ValueError):
        sys.exit(2)

    print('Public key is: n = %d and e = %d' % (n, e))
    print('Private key is: n = %d and d = %d' % (n, d))

    tnumber = n + 1
    tmin = -n
    while tnumber >= n or tnumber < tmin:
        tnumber = int(
            input("Enter number to be encrypted (%d <= n <= %d): " % (tmin, n - 1)))

    c = power_mod_n(tnumber, e, n)    # pow(tnumber,e) % n
    m = power_mod_n(c, d, n)          # pow(c,d) % n

    print('%d encrypted is: %d' % (tnumber, c))
    print('%d decrypted is: %d' % (c, m))


if __name__ == '__main__':
    sys.exit(main())
