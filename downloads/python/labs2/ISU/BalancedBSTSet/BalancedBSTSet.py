#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package BalancedBSTSet
#
#  Amortized Weight-Balanced Trees.
#
#  @author Paulo Roma Cavalcanti
#  @date 23/09/2018
#

from __future__ import print_function
import sys
from random import randint

## Compare two objects.
#
# @return (x > y) - (x < y)
#
def cmp(x, y):
    """
    Replacement for built-in function cmp that was removed in Python 3.

    Compare the two objects x and y and return an integer according to
    the outcome. The return value is negative if x < y, zero if x == y
    and strictly positive if x > y.
    """

    return (x > y) - (x < y)

##
# Binary search tree implementation of the Collections interface.
#  - The \_\_contains\_\_() and remove() methods of Collections Abstract Base Classes are overridden
#    to search the tree without using the iterator.
#  - Instances of this class always maintain node counts that is,
#    the Node.counter variable of the Node interface is calculated in O(1).
#  - If constructed with the isSelfBalancing flag True, instances of this tree are
#    self-balancing:
#     - whenever an add(), remove(), or BSTIterator.remove() operation causes any node
#       to become unbalanced, <br>
#       a rebalance operation is automatically performed at the highest unbalanced node.
#
#   To run:
#      - python BalancedBSTSet.py
#
#   @author Paulo Roma Cavalcanti
#   @since 23/09/2018
#   @see <a href="http://en.wikipedia.org/wiki/Scapegoat_tree">Scapegoat tree</a>
#   @see <a href="http://cg.scs.carleton.ca/~morin/teaching/5408/refs/gr93.pdf">Original paper</a>
#   @see <a href="https://docs.python.org/3/library/collections.abc.html">Collections Abstract Base Classes</a>
#   @see <a href="https://walkccc.github.io/CLRS/Chap17/Problems/17-3/">Amortized weight-balanced trees</a>
#
class BalancedBSTSet(object):
    ##
    # Node type for this implementation.
    #
    class Node(object):
        ##
        #  Constructor given a data object and the parent of this node.
        #
        #  @param key data object.
        #  @param parent parent node.
        #
        def __init__(self, key, parent):
            ## Data (object) in this node.
            self.data = key
            ## Reference to the parent node.
            self.parent = parent
            ## Number of nodes in the subtree rooted at this node.
            self.counter = 0
            ## Reference to the left child node.
            self.left = None
            ## Reference to the right child node.
            self.right = None

        ## Return a string representation of this node.
        def __str__(self):
            return str(self.data)

        ## Return a string representation of this node.
        def __repr__(self):
            return "Node: %s, Balance: %s, Size: %d" % \
                (self.data, self.counter, sys.getsizeof(self))

        ## Returns whether this node is not balanced.
        def isUnBalanced(self, num, den):
            return ((self.left != None and self.left.counter * den >= self.counter * num) or
                    (self.right != None and self.right.counter * den >= self.counter * num))

        ## Compares the data of this node to a given key.
        #
        #  @return 1 if the data of this object is greater than key's, <br>
        #         -1 if the data of this object is smaller than key's or <br>
        #          0 if it is equal
        #
        def compareTo(self, key):
            return cmp(self.data, key)

    ##
    # Constructs an empty binary search tree. If the isSelfBalancing
    # flag is True, the tree will be self-balancing: if so, whenever an add(),
    # remove(), or BSTIterator.remove() operation causes any node to become
    # unbalanced, a rebalance operation is automatically performed at the
    # highest unbalanced node.
    #
    # The given @f$\frac12 \leq \alpha = \frac{top}{bottom} < 1@f$ is used for
    # the balance condition.
    # An @f$\alpha@f$ of 1, therefore, would describe a linked list as balanced,
    # whereas an @f$\alpha@f$ of 0.5 would only match almost complete binary trees.
    #
    # Maintains node counts whether or not isSelfBalancing is True.
    #
    # @param isSelfBalancing True if this binary search tree is
    #   to be self-balancing, and False otherwise.
    # @param top numerator of the fraction @f$\alpha@f$.
    # @param bottom denominator of the fraction @f$\alpha@f$.
    # @throws AttributeError if @f$\frac{top}{bottom} < \frac12@f$
    #
    def __init__(self, isSelfBalancing=False, top=0, bottom=0):
        if isSelfBalancing:
            if bottom == 0:
                top = 2
                bottom = 3
            elif (bottom > 2 * top or bottom <= top):
                raise AttributeError

        ## Root of this tree.
        self.__root = None

        ## Number of elements in this tree.
        self.__size = 0

        ## Turns balancing on or off.
        self.__doBalance = isSelfBalancing

        ## Numerator of the self-balancing tree's @f$\alpha@f$ value.
        self.__numerator = top

        ## Denominator of the self-balancing tree's @f$\alpha@f$ value.
        self.__denominator = bottom

    ##
    # Returns a read-only view of the root node of this tree.
    # @return root node of this tree.
    #
    def root(self):
        return self.__root

    ## Return whether this tree is empty.
    def isEmpty(self):
        return self.__root is None

    ##
    #  Recursively creates a tree from a sorted array of nodes.
    #
    #  @param arr array of nodes.
    #  @param start beginning of the array.
    #  @param end end of the array.
    #  @return root of the tree.
    #  @see https://articles.leetcode.com/convert-sorted-array-into-balanced/
    #
    def __rebalanceRec(self, arr, start, end):
        if (start > end):
            return None

        # subarray size is > 1, so split the subarray into two subarrays
        middle = start + (end - start) // 2
        node = arr[middle]
        node.counter = 0  # erases previous counter in the node

        # recursively call rebalanceRec() to further split each subarray
        # until subarray size is 1
        node.left = self.__rebalanceRec(arr, start, middle - 1)
        if (node.left != None):
            node.left.parent = node
            node.counter += node.left.counter

        node.right = self.__rebalanceRec(arr, middle + 1, end)
        if (node.right != None):
            node.right.parent = node
            node.counter += node.right.counter

        if (node.left == None and node.right == None):
            node.counter = 1
        else:
            node.counter += 1

        return node

    ##
    # Performs a rebalance operation on the given subtree. This operation
    # does not create or destroy any nodes and does not change the size of
    # this tree.
    #
    # @param bstNode root of the subtree to be rebalanced.
    #
    def rebalance(self, bstNode):
        if bstNode is None:
            return
        arr = self.__inOrder(bstNode, None)
        proot = bstNode.parent
        lside = (proot != None) and (proot.left == bstNode)
        n = self.__rebalanceRec(arr, 0, len(arr) - 1)
        if (proot != None):
            if lside:
                proot.left = n
            else:
                proot.right = n
        else:
            self.__root = n
        n.parent = proot

    ##
    #  Executes an in order traversal of the tree rooted at a given node.
    #
    #  @param node root.
    #  @param arr array for holding the node data.
    #  @return arr.
    #
    def __inOrder(self, node, arr):
        if arr is None:
            arr = []
        if (node != None):
            self.__inOrder(node.left, arr)
            arr.append(node)
            self.__inOrder(node.right, arr)

        return arr

    ##
    # Returns whether the given object is in this tree.
    #
    # @param obj given object.
    # @return True if the object is in the tree, or False otherwise.
    #
    def __contains__(self, obj):
        return self.findEntry(obj) != None

    ##
    #  Increments all node counters in the path to the root.
    #
    #  @param n reference node.
    #  @return first (higher) unbalanced node, or None if all nodes are balanced.
    #
    def __incrementNodesUp(self, n):
        node = None
        while (n != None):
            n.counter += 1
            if (n.isUnBalanced(self.__numerator, self.__denominator)):
                node = n
            n = n.parent

        return node

    ##
    #  Decrements all node counters in the path to the root.
    #
    #  @param n reference node.
    #  @return first (higher) unbalanced node, or None if all nodes are balanced.
    #
    def __decrementNodesUp(self, n):
        node = None
        while (n != None):
            n.counter -= 1
            if (n.isUnBalanced(self.__numerator, self.__denominator)):
                node = n
            n = n.parent

        return node

    ##
    # Adds the given object to this tree.
    #
    # @param key given object.
    # @return True if the object was found, and False otherwise.
    #
    def add(self, key):
        if self.__root is None:
            self.__root = self.Node(key, None)
            self.__size += 1
            self.__root.counter += 1
            return True

        current = self.__root
        while True:
            comp = current.compareTo(key)
            if (comp == 0):
                # key is already in the tree
                return False
            elif (comp > 0):
                if (current.left != None):
                    current = current.left
                else:
                    current.left = self.Node(key, current)
                    self.__size += 1
                    n = self.__incrementNodesUp(current.left)
                    if (n != None and self.__doBalance):
                        self.rebalance(n)
                    return True
            else:
                if (current.right != None):
                    current = current.right
                else:
                    current.right = self.Node(key, current)
                    self.__size += 1
                    n = self.__incrementNodesUp(current.right)
                    if (n != None and self.__doBalance):
                        self.rebalance(n)
                    return True

    ## Adds an iterable to the tree.
    def update(self, lst):
        for i in lst:
            self.add(i)

    ## like lists.
    def append(self, n):
        return self.add(n)

    ##
    # Removes the given object from this tree.
    #
    # @param obj given object.
    # @return True if the object was found, and False otherwise.
    #
    def remove(self, obj):
        n = self.findEntry(obj)
        if n is None:
            return False

        self.unlinkNode(n)
        return True

    ##
    # Returns the node containing key, or None if the key is not
    # found in the tree.
    # @param key
    # @return the node containing key, or None if not found.
    #
    def findEntry(self, key):
        current = self.__root
        while (current != None):
            comp = current.compareTo(key)
            if (comp == 0):
                return current
            elif (comp > 0):
                current = current.left
            else:
                current = current.right
        return None

    ##
    # Returns the successor of the given node.
    # @param n
    # @return the successor of the given node in this tree,
    #   or None if there is no successor.
    #
    def successor(self, n):
        if (n == None):
            return None
        elif (n.right != None):
            # leftmost entry in right subtree
            current = n.right
            while (current.left != None):
                current = current.left
            return current
        else:
            # we need to go up the tree to the closest ancestor that is
            # a left child its parent must be the successor
            current = n.parent
            child = n
            while (current != None and current.right == child):
                child = current
                current = current.parent
            # either current is None, or child is left child of current
            return current

    ##
    # Returns the antecessor of the given node.
    # @param n a node.
    # @return the antecessor of the given node in this tree,
    #   or None if there is no antecessor.
    #
    def antecessor(self, n):
        if n is None:
            return None
        elif (n.left != None):
            # rightmost entry in left subtree
            current = n.left
            while (current.right != None):
                current = current.right
            return current
        else:
            # we need to go up the tree to the closest ancestor that is
            # a right child its parent must be the antecessor
            current = n.parent
            child = n
            while (current != None and current.left == child):
                child = current
                current = current.parent
            # either current is None, or child is right child of current
            return current

    ##
    # Removes the given node, preserving the binary search
    # tree property of the tree.
    #
    # @param n node to be removed.
    #
    def unlinkNode(self, n):
        # first deal with the two-child case copy
        # data from successor up to n, and then delete successor
        # node instead of given node n
        startNode = None
        if (n.left != None and n.right != None):
            s = self.successor(n)
            n.data = s.data
            n = s  # causes s to be deleted in code below
            startNode = s.parent

        # n has at most one child
        replacement = None
        if (n.left != None):
            replacement = n.left
        elif (n.right != None):
            replacement = n.right

        # link replacement on tree in place of node n
        # (replacement may be None)
        if (n.parent == None):
            self.__root = replacement
        else:
            if (n == n.parent.left):
                n.parent.left = replacement
            else:
                n.parent.right = replacement

        if (replacement != None):
            replacement.parent = n.parent

        if (startNode == None):
            startNode = n.parent
        node = self.__decrementNodesUp(startNode)
        if (node != None and self.__doBalance):
            self.rebalance(node)

        self.__size -= 1

    ## Returns an iterator for this tree.
    def iterator(self):
        return self.BSTIterator(self)

    ## Returns the number of elements in this tree.
    def __len__(self):
        return self.__size

    ## Returns an array containing all of the elements in this tree.
    # If the collection makes any guarantees as to what order its elements
    # are returned by its iterator, this method must return the elements in the same order.
    #
    # @return a list of node data (keys).
    #
    def toArray(self):
        arr = []
        for n in self.iterator():
            arr.append(n)
        return arr

    ## Indexing operator [].
    #
    # @throw IndexError.
    # @param ind index to retrieve.
    # @return ind-ith value in the tree, or an exception.
    #
    def __getitem__(self, ind):
        if ind < 0 or ind >= self.__size:
            raise IndexError

        for i, n in enumerate(self.iterator()):
            if i == ind:
                return n

    ## Iterator as a generator.
    #
    # Generators are functions having an yield keyword.
    # Any function which has “yield” in it is a generator.
    #
    # Generator takes care of creating the iterable.
    # It also takes care of creating the underlying iterator.
    # And next() of this iterator() is such that it returns each ‘yield’
    #
    # @see https://www.agiliq.com/blog/2017/11/how-python-generators-are-similar-iterators/
    #
    def __iter__(self):
        for n in self.iterator():
            yield n

    ## Reversed Iterator.
    def __reversed__(self):
        for n in reversed(self.iterator()):
            yield n

    ## Return the height of this tree.
    # The height of a tree is the height of its root node.
    #
    def height(self):
        return self.getHeight(self.__root)

    ## Return the height of a subtree.
    # The height of a node is the number of edges on the longest path between that node and a leaf.
    # The height of a leaf is 0.
    #
    # @param root node of the subtree.
    #
    def getHeight(self, root):
        if root != None:
            return 1 + max(self.getHeight(root.left), self.getHeight(root.right))
        else:
            return -1

    ##
    # Returns a representation of this tree as a multi-line string.
    # The tree is drawn with the root at the left and children are
    # shown top-to-bottom.  Leaves are marked with a "-" and non-leaves
    # are marked with a "+".
    #
    def __repr__(self):
        sb = []
        self.__toStringRec(self.__root, sb, 0)
        return ''.join(sb)

    ## Prints the nodes of this tree in order.
    def __str__(self):
        st = ""
        for n in self:
            st += str(n) + " "
        return st

    ##
    # Preorder traversal of the tree that builds a string representation
    # in the given StringBuilder.
    #
    # @param n root of subtree to be traversed.
    # @param sb list in which to create a string representation.
    # @param depth depth of the given node in the tree.
    #
    def __toStringRec(self, n, sb, depth):
        sb.append("  " * depth)

        if n is None:
            sb.append("-\n")
            return

        if (n.left is not None or n.right is not None):
            sb.append("+ ")
        else:
            sb.append("- ")

        sb.append(str(n) + " (" + str(n.counter) + ")")
        sb.append("\n")
        if (n.left is not None or n.right is not None):
            self.__toStringRec(n.left, sb, depth + 1)
            self.__toStringRec(n.right, sb, depth + 1)

    ##
    # Iterator implementation for this binary search tree. The elements
    # are returned in ascending order according to their natural ordering.
    #
    # A reversed iterator calls \_\_reversed\_\_() first and then \_\_iter\_\_().
    #
    class BSTIterator(object):
        ## iterates forward.
        forward = 0
        ## iterates backward.
        backward = 1

        ## return the smallest value of the tree.
        def getSmallestValue(self, n):
            if (n != None):
                while (n.left != None):
                    n = n.left
            return n

        ## return the largest value of the tree.
        def getLargestValue(self, n):
            if (n != None):
                while (n.right != None):
                    n = n.right
            return n

        ## getter for the iterator direction.
        @property
        def direction(self):
            # maybe a new node has been added since this iterator creation.
            self.direction = self.__dir
            return self.__tree.successor if self.__dir == BalancedBSTSet.BSTIterator.forward else self.__tree.antecessor

        ## setter for this iterator direction: forward or backward.
        @direction.setter
        def direction(self, dir):
            ## holds the current traversal direction.
            self.__dir = dir
            if self.__dir == BalancedBSTSet.BSTIterator.forward:
                # start out at smallest value.
                self.__current = self.getSmallestValue(self.__tree.root())
            else:
                # start out at largest value.
                self.__current = self.getLargestValue(self.__tree.root())

        ##
        # Constructs an iterator starting at the smallest
        # ot largest element in the tree.
        #
        def __init__(self, tree):
            ## Node returned by last call to next() and available
            #  for removal. This field is None when no node is
            #  available to be removed.
            self.__pending = None

            ## The tree to be traversed.
            #  Inner classes do not have access to outer class variables.
            self.__tree = tree

            ## Node to be returned by next call to next().
            self.__current = None

            ## direction of iteration: forward or backward.
            self.direction = BalancedBSTSet.BSTIterator.forward

            ## move method.
            self.__move = self.direction

        ## Forward iterator.
        def __iter__(self):
            self.__move = self.direction
            return self

        ## Reverse iterator.
        def __reversed__(self):
            # __iter__ is called after leaving here.
            self.direction = BalancedBSTSet.BSTIterator.backward
            return self

        ##
        # Whether current is not None.
        #
        def hasNext(self):
            return self.__current != None

        ## Return the content of the current node without advancing.
        def peek(self):
            if self.__current is None:
                return None
            return self.__current.data

        ##
        # Returns current node, which is saved in pending.
        # Current is set to successor(current).
        #
        def __next__(self):
            if (not self.hasNext()):
                raise StopIteration
            self.__pending = self.__current
            self.__current = self.__move(self.__current)
            return self.__pending.data

        ## For python 2.
        def next(self):
            return self.__next__()

        ##
        # Removes the node returned by the last call to next().
        # Current pos to the successor of
        # pending, but if pending has two children, then
        # unlinkNode(pending) will copy the successor's data
        # of pending and delete the successor node.
        # So in this case, we want to end up with current
        # pointing to the pending node.
        #
        def remove(self):
            if self.__pending is None:
                raise IndexError

            if (self.__pending.left != None and self.__pending.right != None):
                self.__current = self.__pending

            self.__tree.unlinkNode(self.__pending)
            self.__pending = None

##
#  Generates an array with a random size,
#  filled with random elements.
#
#  @param n maximum array size.
#  @param vrange interval to choose the random elements from.
#  @return an array.
#
def generateRandomArray(n, vrange):
    v = []
    for i in range(randint(1, n)):
        v.append(randint(1, vrange))
    return v


##
#  Main function for testing.
#
#  args not used.
#
def main(args=None):
    if args is None:
        args = sys.argv

    arr1 = [5, 4, 2, 16, 10, 7, 20, 14, 15, 12]
    arr2 = generateRandomArray(15, 500)
    arr3 = generateRandomArray(20, 500)
    arr4 = generateRandomArray(20, 50)
    arr5 = generateRandomArray(20, 90)

    rebal = False
    if len(args) > 1:
        if args[1] == "True":
            rebal = True

    arr = arr5
    bst = BalancedBSTSet(rebal)
    bst.update(arr)

    print("Original tree: height = %d\n%r" % (bst.height(), bst))
    if not rebal:
        bst.rebalance(bst.root())
        print("Rebalanced tree: height = %d\n%r" % (bst.height(), bst))

    a = bst.toArray()
    print("toArray:")
    for i in a:
        print("%s, " % i, end="")
    print("\b\b: size = %d, len = %d" % (len(a), len(bst)))

    print("\nKeys in ascending order:")
    for n in iter(bst):
        if len(args) > 1:
            node = bst.antecessor(bst.findEntry(n))
            prev = node.data if node != None else -1
            print("(%d)" % prev, end="")
        print("%s, " % n, end="")

    print("\n\nKeys in descending order:")
    for n in reversed(bst):  # reversed(bst.iterator()):
        if len(args) > 1:
            node = bst.successor(bst.findEntry(n))
            next = node.data if node != None else -1
            print("(%d)" % next, end="")
        print("%s, " % n, end="")

    print()
    if len(bst) > 3:
        print("\nbst[3] = %d" % bst[3])
    nid = 0
    while (not bst.isEmpty() and nid >= 0):
        try:
            nid = int(input("Choose a node to delete: "))
        except (ValueError, SyntaxError) as e:
            print(e)
            continue
        except KeyboardInterrupt:
            sys.exit("The end.")

        if nid >= 0:
            bst.remove(nid)
            print("Removed node %d: height = %d\n%r" %
                  (nid, bst.height(), bst))


if __name__ == "__main__":
    main()
