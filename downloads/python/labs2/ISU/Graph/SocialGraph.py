#!/usr/bin/env python
# coding: UTF-8
#
## @package SocialGraph
#
# Manages a social network of friendships.
#
# @author Paulo Roma.
# @since 13/09/2018
# @see https://graphviz.readthedocs.io/en/stable/manual.html
# @see http://www.it.usyd.edu.au/~shhong/directed.htm

from __future__ import print_function
import sys
from DiGraph import DiGraph, Edge
from graphviz import Digraph as gdg

##
# Create a graph to model a social network of friendships.
# See the homework description.
#
class SocialGraph(object):
    ## Constructor from a file of commands.
    def __init__(self, file):
        ## Graph of friendship.
        self.dg = DiGraph()
        self.readGraphFile(file)

    ## Create a graph from a file.
    def readGraphFile(self, file):
        for line in file:
            command = line.split(None)  # skips any number of white spaces
            print(line, end="")
            if (command[0] == "add"):
                print("addEdge: (%r) - %d edges, %d vertices\n" %
                      (self.dg.addEdge(command[1], command[2], int(command[3])), self.dg.numEdges(), self.dg.numVertices()))
            elif (command[0] == "showFriends"):
                print("%s" % self.dg.adjacentTo(command[1]))
            elif (command[0] == "remove"):
                print("remove: (%r) - %d edges, %d vertices\n" %
                      (self.dg.removeVertex(command[1]), self.dg.numEdges(), self.dg.numVertices()))
            elif (command[0] == "recommendFriends"):
                print(self.recommendFriends(
                    command[1], command[2], int(command[3])))
            elif (command[0] == "shortestPath"):
                print(self.dg.Dijkstra2(command[1], command[2]))
            else:
                print("Invalid command: %s ", command[0])
        print("\n\n")
        file.close()

    ## Return a string representation of this graph.
    def __str__(self):
        return str(self.dg)

    ## Return a graph description in the DOT language and
    # save a png file with a graphical representation of this graph.
    def __repr__(self):
        dot = gdg('Social_Graph', format='png',
                  filename='social.gv', engine='neato')
        edg = self.dg._DiGraph__generate_edges()
        for V, e in edg:
            v = e.getVertex()
            c = e.getCost()
            dot.edge(V, v, label=str(c))

        dot.view()
        return dot.source

    ## Recommend topK (e.g., 5) best friend candidates who are not already a friend of personOfInterest.
    #
    # - If dist option is used, find the shortest path from personOfInterest to all
    #   the other nodes in the graph using Dijkstra's single source shortest path algorithm
    #   and friendship distances. The smaller the distance means the closer the relationship.
    #
    # - If weightedDist option is used, after computing the shortest path like in the dist option
    #   to all the other nodes in the graph, multiply each distance with the total number of edges
    #   in the graph less the number of incoming edges to that node.
    #
    # For instance, suppose the graph has a total of 10 edges.
    #
    # Suppose the shortest distance from personOfInterest to node A is 5 and there are
    # 4 incoming edges to A, the weighted distance is 5#(10-4)=30.
    # - The lower the weighted distance, the better the candidate.
    #
    # This method considers both distance and popularity.
    # The person with a lot of incoming edges means that the person is likely more well-liked
    # by other people and should be recommended.
    #
    # - Sort the distance/weighted distance in increasing order.
    #
    # - If there are less than topK candidates, return only those candidates.
    # - If there are more than topK candidates, return only the topK candidates,
    #   when there are no other candidates with the same distance/weighted distance
    #   as the last candidate in the topK list.
    # - If there are other candidates with the same distance/weighted distance as the
    #   last candidate in the topK list, return all the candidates with the same distance.
    #   In this case, more than topK candidates are included in the list.
    #
    # @param personOfInterest Name of the person to recommend new friend candidates for.
    # @param option Either dist or weightedDist, which indicates whether to use
    #       the friendship distance or the weighted friendship distance.
    #
    # @param topK Desirable maximum number of candidate friends to recommend.
    # @return List of candidate friends.
    #
    def recommendFriends(self, personOfInterest, option, topK):
        friends = []
        m = self.dg.Dijkstra(personOfInterest)
        for s in m.keys():
            dist = m.get(s)
            if (s != personOfInterest and dist < self.dg.getInfinity()):
                if option == "weightedDist":
                    dist *= (self.dg.numEdges() -
                             len(self.dg.incomingEdges(s)))
                e = Edge(s, dist)
                friends.append(e)

        friends.sort(key=lambda pair: pair.getCost())

        count = 0
        edges = self.dg.adjacentTo(personOfInterest)
        selectedFriends = []
        for f in friends:
            if f not in list(edges):  # calls __eq__ in Edge.
                count += 1
                if (count <= topK) or (f.cmpCost(selectedFriends[-1]) == 0):
                    selectedFriends.append(f)

        return selectedFriends

##
# Create an empty graph aGraph.
# Parse each line, print the entire line on the console, and call the corresponding method.
#
# The command is case sensitive.
# Assume that the file format is correct.
#
# add arg1 arg2 arg3
#      - call aGraph.addEdge(arg1, arg2, int(arg3))
#
# showFriends arg1
#  - call aGraph.adjacentTo(arg1)
#
# remove arg1
#  - call aGraph.remove(arg1)
#
# recommendFriends arg1 arg2 arg3
#        - call the recommendFriends(arg1, arg2, int(arg3)), where:
#
#            - arg1 is the name of the person to recommend new friends for.
#            - arg2 is either "dist" or "weightedDist" indicating the method
#            to select people to recommend as new friends.
#            - int(arg3) is the maximum number of new friends to recommend.
#
# @param args args[1] Input filename with all the commands and arguments.
#
def main(args=None):

    if args == None:
        args = sys.argv

    fileName = ""

    if len(args) == 1:
        print("Social Graph: a file must be given - using \"infileAss5.txt\"")
        fileName = "infileAss5.txt"
    else:
        fileName = args[1]

    try:
        file = open(fileName)
    except IOError:
        sys.exit("Social Graph: file \"%s\" not found", fileName)

    sg = SocialGraph(file)

    print("%r" % sg)


if __name__ == "__main__":
    sys.exit(main())
