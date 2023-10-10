#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4
#
## @package DiGraph
#
# A very simple directed graph class.
#
# @author Paulo Roma.
# @since 12/09/2018
# @see https://www.python-course.eu/graphs_python.php

import sys
import heapq

## Replacement for built-in function cmp that was removed in Python 3.
#
#  Compare the two objects x and y and return an integer according to
#  the outcome.
#
#  @param x first object.
#  @param y second object.
#  @return a negative value if x < y,
#          zero if x == y
#          and strictly positive if x > y.
#
def cmp(x, y):
    return (x > y) - (x < y)

## An edge holds the vertex it points to and its cost (or weight).
#
class Edge(object):
    ## Constructor from a node and its cost.
    #
    #  @param n node/vertex.
    #  @param c weight or cost associated with the edge.
    #
    def __init__(self, n, c):
        ## Node/vertex the edge points to.
        self.__node = n
        ## Edge cost.
        self.__cost = c

    ## Get the target vertex.
    #
    #  @return the node this edge points to.
    def getVertex(self):
        return self.__node

    ## Get this edge cost.
    #
    #  @return the cost of this edge.
    def getCost(self):
        return self.__cost

    ## Set the cost of this edge.
    #
    #  @param c given cost.
    #
    def setCost(self, c):
        self.__cost = c

    ##
    #  Compare two edges based on the cost only, not on the vertex.
    #
    #  @param other the edge for comparing this edge to.
    #  @return -cmp(self.getCost(), other.getCost())
    #
    def cmpCost(self, other):
        return -cmp(self.getCost(), other.getCost())

    ## An unambiguous representaion of this edge.
    #
    #  @return a string representation of this edge.
    #
    def __repr__(self):
        return "<%s, %s>" % (self.__node, self.__cost)

    ## An Edge object must be hashable.
    #
    #  @return hash((self.__node, self.__cost))
    #
    def __hash__(self):
        return hash((self.__node, self.__cost))

    ##
    #  Operator ==. Only compare the nodes but not the cost of the nodes.
    #
    #  @param obj the edge for comparing this edge to.
    #  @return (self.__node == obj.__node)
    #
    def __eq__(self, obj):
        if (self is obj):
            return True

        if (obj == None) or (type(obj) != type(self)):
            return False

        return (self.__node == obj.__node)

    ##
    #  Operator in. Only compare the nodes but not the cost of the nodes.
    #
    def __contains__(self, obj):
        return self == obj
##
# Class implementing a directed graph structure using a dictionary
# for holding vertices and a set for holding edges.
#
class DiGraph(object):

    ##
    # Create an empty graph.
    #
    def __init__(self):
        ## A dictionary that stores an entry of a node, as the key, and a set of outgoing edges
        # (destination node, weight) from the node, as its value.
        self.graph = {}

        ## Total number of edges in the graph.
        self.__numEdges = 0

        ## The largest edge distance.
        # self.__infinity = sys.maxint
        self.__infinity = sys.maxsize

        ## Holds the path from a source node to a given node.
        self.__pathToNode = None

        ## Accumulated distance from source to a node.
        self.__dist = None

    ## Returns the largest edge cost.
    def getInfinity(self):
        return self.__infinity

    ##
    # Add a directed edge from the source node to the destination node.
    # If there is already existing edge from src to dst,
    # replace the existing weight with the new weight.
    #
    # @param src Source node.
    # @param dst Destination node.
    # @param c Weight of the edge.
    # @return
    #         - False if src or dst is None,
    #         - or c <= 0,
    #         - or src == dst,
    #         - True if a new edge from src to dst is added with the weight.
    #
    def addEdge(self, src, dst, c=1):
        if (src == None or dst == None or c <= 0 or src == dst):
            return False

        # the edge set of src
        eSet = self.graph.get(src)
        e = Edge(dst, c)  # new edge
        if eSet == None:
            # no edge starting at src, so create a new edge set
            eSet = set()
            self.__numEdges += 1
        else:
            ed = self.getEdge(src, dst)
            if (ed != None):
                ed.setCost(c)
                return True
            else:
                self.__numEdges += 1

        eSet.add(e)  # a set does not have duplicates

        self.graph[src] = eSet
        if not self.hasVertex(dst):
            self.addVertex(dst)

        return True

    ##
    # Add a vertex to the graph with an empty set of edges associated with it.
    #
    # @param vertex Vertex to be added.
    # @return
    #         - False if vertex is None or vertex is already in the graph.
    #         - True otherwise.
    #
    def addVertex(self, vertex):
        if (vertex == None or self.hasVertex(vertex)):
            return False

        self.graph[vertex] = set()
        return True

    ##
    # Returns the number of vertices in this graph.
    #
    # @return Number of vertices (nodes) in the graph.
    #
    def numVertices(self):
        return len(self.graph)

    ##
    # Returns all vertices in this graph.
    #
    # @return A set of vertices in this graph.
    #     When there are no vertices in the graph, return an empty set.
    #
    def vertices(self):
        return self.graph.keys()

    ##
    # Gets all vertices adjacent to a given vertex.
    #
    # @param vertex
    # @return A set of vertices in which there is an edge from the given vertex to each of these vertices.
    #
    #         - An empty set is returned if there is no adjacent node,
    #         - or the vertex is not in the graph,
    #         - or vertex is None.
    #
    def adjacentTo(self, vertex):
        return set() if (vertex == None or not self.hasVertex(vertex)) else set(self.graph.get(vertex))

    ##
    # Checks whether a given vertex is in the graph.
    #
    # @param vertex given vertex.
    # @return
    #         - True if the given vertex is in the graph.
    #         - False otherwise, including the case of a None vertex.
    #
    def hasVertex(self, vertex):
        return self.graph.get(vertex) != None

    ##
    # Returns the number of edges in this graph.
    #
    # @return Total number of edges in this graph
    #
    def numEdges(self):
        return self.__numEdges

    ##
    # Gets the edge from src to dst, if such an edge exists.
    #
    # @param src source vertex.
    # @param dst target vertex.
    # @return
    #         - an edge if there exists an edge from src to dst regardless of the weight.
    #         - None otherwise (including when either src or dst is None or src or dst is not
    #           in the graph).
    #
    def getEdge(self, src, dst):
        if (src == None or dst == None or not self.hasVertex(src) or not self.hasVertex(dst)):
            return None

        eSet = self.graph.get(src)

        for ed in eSet:
            if dst == ed.getVertex():
                return ed

        return None

    ##
    # Check whether an edge from src to dst exists.
    #
    # @param src source vertex.
    # @param dst target vertex.
    # @return
    #         - True if there exists an edge from src to dst regardless of the weight, and
    #         - False otherwise (including when either src or dst is None  or src or dst is not
    #           in the graph).
    #
    def hasEdge(self, src, dst):
        return self.getEdge(src, dst) != None

    ##
    # Remove this vertex from the graph if possible and calculate the number of edges in
    # the graph accordingly. For instance, if the vertex has 4 outgoing edges and 2 incoming edges,
    # the total number of edges after the removal of this vertex is subtracted by 6.
    #
    # @param vertex Vertex to be removed.
    # @return
    #         - False if the vertex is None, or there is no such vertex in the graph.
    #         - True if removal is successful.
    #
    def removeVertex(self, vertex):
        if (vertex == None or not self.hasVertex(vertex)):
            return False

        eSet = self.graph.get(vertex)
        self.__numEdges -= len(eSet)

        # remove all edges pointing to vertex
        for v in self.incomingEdges(vertex):
            eSet = self.graph.get(v)
            eSet.remove(self.getEdge(v, vertex))
            self.__numEdges -= 1

        self.graph.pop(vertex)
        return True

    ##
    # Return a set of nodes with edges coming to this given vertex.
    #
    # @param vertex given vertex.
    # @return
    #         - empty set if the vertex is None or the vertex is not in this graph.
    #         - Otherwise, return a non-empty set consists of nodes with edges coming to this vertex.
    #
    def incomingEdges(self, vertex):
        if (vertex == None or not self.hasVertex(vertex)):
            return None

        hSet = set()
        for v in self.vertices():
            if v != vertex:
                if self.hasEdge(v, vertex):
                    hSet.add(v)

        return hSet

    ## A method generating the edges of the
    # graph. Edges are represented as tuples
    # with one (a loop back to the vertex) or two
    # vertices.
    #
    def __generate_edges(self):
        edges = []
        for vertex in self.graph:
            for neighbour in self.graph[vertex]:
                if (neighbour, vertex) not in edges:
                    edges.append((vertex, neighbour))
        return edges

    ## Return a representation of the graph as a string.
    def __repr__(self):
        res = "vertices: "
        for k in self.graph:
            res += str(k) + " "
        res += "\nedges: "
        for edge in self.__generate_edges():
            res += str(edge) + " "
        return res

    ## Compute Dijkstra single source shortest path from the source node.
    #
    # @param source Source node.
    # @return
    #         - Empty dictionary if the source is None,
    #         - or it is not a vertex in the graph,
    #         - or it does not have any outgoing edges.
    #         - Otherwise, return a dictionary of entries, each having a vertex and smallest cost going from the source node to it.
    # @see <a href="http://en.wikipedia.org/wiki/Dijkstra%27s_algorithm">Dijkstra's algorithm</a>
    # @see https://docs.python.org/2/library/heapq.html
    # @see https://www.pythoncentral.io/priority-queue-beginners-guide/
    #
    def Dijkstra(self, source):
        # a final variable can only be initialized once,
        # either via an initializer or an assignment statement.
        if self.__dist is None:
            self.__dist = {}

        dist = self.__dist

        if (source == None or not self.hasVertex(source) or not self.adjacentTo(source)):
            return dist

        visited = {}
        previous = {}

        # a priority queue
        q = []

        for v in self.vertices():           # Initializations
            # Mark distances from source to v as not yet computed
            dist[v] = self.getInfinity()
            visited[v] = False              # Mark all nodes as unvisited
            # Previous node in optimal path from source
            previous[v] = None
            # This is only necessary to get the shortest path
        # Distance from source to itself is zero
        dist[source] = 0
        heapq.heappush(q, source)            # Start off with the source node

        while q:                             # The main loop
            # vertex in Q with smallest distance in dist
            u = heapq.heappop(q)
            # and has not been visited (Source node in first case)
            if visited[u]:
                continue

            visited[u] = True                # mark this node as visited

            for e in self.adjacentTo(u):
                v = e.getVertex()
                # accumulate shortest dist from source
                alt = dist[u] + self.getEdge(u, v).getCost()
                if alt < dist[v]:
                    # keep the shortest dist from src to v
                    dist[v] = alt
                    previous[v] = u
                    if not visited[v]:
                        # Add unvisited v into the Q to be processed
                        heapq.heappush(q, v)

        self.__pathToNode = previous
        return dist

    ##
    # Compute Dijkstra shortest path from the source to the destination node.
    #
    # @param source Source node
    # @param dest Destination node
    # @return
    #         - Empty list if the source or dest are None,
    #         - or they are not a vertex in the graph,
    #         - or source does not have any outgoing edges.
    #         - Otherwise, return a list of edges for reaching dest from source with the smallest cost.
    # @see <a href="http://en.wikipedia.org/wiki/Dijkstra%27s_algorithm">Dijkstra's algorithm</a>
    #
    def Dijkstra2(self, source, dest):
        sp = []

        if (dest == None or not self.hasVertex(dest)):
            return sp

        d = self.Dijkstra(source)
        if (not d or self.__pathToNode.get(dest) == None):
            return sp

        v = dest
        while v != source and v != None:
            sp.insert(0, Edge(v, d.get(v)))
            v = self.__pathToNode.get(v)

        if sp:
            sp.insert(0, Edge(source, d.get(source)))

        return sp

##
#   Main method. Creates a simple graph.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    if (len(argv) > 1):
        f = argv[1]

    try:
        g = DiGraph()
        g.addVertex("f")
        g.addEdge("a", "d")
        g.addEdge("a", "c")
        g.addEdge("c", "d")
        g.addEdge("c", "b")
        g.addEdge("c", "e")
        g.addEdge("e", "c")
        g.Dijkstra("c")
        print(g.numEdges())
        print("Dijkstra from c to e: %s" % g.Dijkstra2("c", "e"))
        print(g)
        print("incomingEdges of c: %s" % g.incomingEdges("c"))
        g.removeVertex("c")
        print("Removed vertex c")
        print(g)
    except IOError:
        sys.exit("File %s not found." % f)


if __name__ == "__main__":
    sys.exit(main())
