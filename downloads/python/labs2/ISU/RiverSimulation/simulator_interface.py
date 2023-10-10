try:
   from tkinter import *
   from tkinter import filedialog
except:
   from Tkinter import *
   import tkFileDialog as filedialog
from River import River

###
# @package AD2
#
# The Graphical User Interface river simulator file
#
# @author Fabio Victorino da Cruz
# @since /01/02/2018
#
##

##
# class that represents the river simulator interface
##
class Principal(Frame):
    """ Represents the Graphical User Interface for the river simulator """

    def __init__(self, master=None):
        """ Initialize the interface """
        Frame.__init__(self, master)
        # River reference
        self.river = None

        # menu bar
        self.mainMenu = Menu(self)
        fileMenu = Menu(self.mainMenu)
        # saves the river instance to a text file
        fileMenu.add_command(label="save", command=self.saveRiver)
        self.mainMenu.add_cascade(label="file", menu=fileMenu)
        self.mainMenu.add_command(label="help", command=self.showHelp)
        # disable the file menu initially to avoid calling methods on self.river=None
        self.mainMenu.entryconfig("file", state="disabled")
        # adds the menu to the interface
        self.master.config(menu=self.mainMenu)

        # Call showInput when write changes ("w") happen on the radio buttons
        self.option = IntVar() # variable that tracks changes to the radio buttons
        self.option.set(0) # initial value
        self.option.trace("w", self.showInput)

        # top side frame. Holds settings widgets
        self.settingsFrame = Frame(self)
        self.settingsFrame.pack(fill="x")

        # simulation cycles number field
        cyclesLabel = Label(self.settingsFrame, text="Number of Cycles")
        cyclesLabel.pack()
        self.cyclesEntry = Entry(self.settingsFrame)
        self.cyclesEntry.pack()

        # seed field
        seedLabel = Label(self.settingsFrame, text="Seed")
        seedLabel.pack()
        self.seedEntry = Entry(self.settingsFrame)
        self.seedEntry.pack()

        # how the river will be generated
        # 0 = randomly
        # 1 = from text file

        optionsLabel = Label(self.settingsFrame, text="River creation")
        optionsLabel.pack(anchor=W)

        # Radio buttons used to toggle between random generation and file
        option0Radio = Radiobutton(self.settingsFrame, text="Random", value=0, variable=self.option)
        option1Radio = Radiobutton(self.settingsFrame, text="File", value=1, variable=self.option)
        option0Radio.pack(anchor=W) # W = West
        option1Radio.pack(anchor=W)

        # Frame destined to show widgets depending on the option variable
        # 0 = river length entry
        # 1 = file name entry and filedialog
        optionsFrame = Frame(self.settingsFrame)
        optionsFrame.pack()

        # option 0
        
        # prepare the frame for random river configuration widgets
        self.riverLengthFrame = Frame(optionsFrame)
        # self.riverLengthFrame.configure(relief="ridge", border=1)
        self.riverLengthFrame.pack()
        # the river length frame has a label and an entry field
        riverLengthLabel = Label(self.riverLengthFrame, text="River length")
        riverLengthLabel.pack()
        self.riverLengthEntry = Entry(self.riverLengthFrame)
        self.riverLengthEntry.pack()

        # option 1
        
        # prepare the frame for text file search widgets
        self.fileNameFrame = Frame(optionsFrame)
        self.fileNameFrame.pack()
        # the file name frame has a label, an entry field and a button
        fileNameLabel = Label(self.fileNameFrame, text="File name")
        self.fileNameEntry = Entry(self.fileNameFrame, width=60)
        fileNameButton = Button(self.fileNameFrame, text="Search", command=self.getFile)

        for widget in (fileNameLabel, self.fileNameEntry, fileNameButton):
            widget.pack() # display the widgets on screen

        # initial call to this method in order to show only one
        # of the optionFrames at once
        self.showInput()

        # button which starts the simulation
        startButton = Button(self.settingsFrame, text="Start", command=self.startSimulation)
        startButton.pack()


        # vertical scroll bar for the simulation area
        yScroll = Scrollbar(self)
        yScroll.pack(side=RIGHT, fill="y")

        # horizontal scroll bar for the simulation area
        xScroll = Scrollbar(self, orient=HORIZONTAL)
        xScroll.pack(side=BOTTOM, fill="x")

        # Simulation text area. The simulation results are shown here.

        # Set the text area scrollbars
        self.simulationText = Text(self, yscrollcommand=yScroll.set, xscrollcommand=xScroll.set)
        self.simulationText.pack(fill="both", expand=True)
        # Disable line breaks and edit
        self.simulationText.configure(border=2, wrap=NONE, state=DISABLED)
        self.showHelp() # show use instructions on the simulationText area

        yScroll.configure(command=self.simulationText.yview)
        xScroll.configure(command=self.simulationText.xview)

        self.pack(fill="both", expand=True) # show window

    ##
    # @param *varInfo print(varInfo) gives ('PY_VAR0', '', 'w').
    #   That parameter is required when the method is bound to the "option" IntVar,
    #   but it does not have a practical use here
    ##
    def showInput(self, *varInfo):
        """ Toggle between random river length and river name file widgets depending on the chosen radio button """
        # 0: river length
        if self.option.get() == 0:
            self.fileNameFrame.pack_forget() # remove from the view
            self.riverLengthFrame.pack() # show on the view
        else: # 1: file name
            self.riverLengthFrame.pack_forget()
            self.fileNameFrame.pack()
        return None


    def getFile(self):
        """ Select a file name through a filedialog and show it in the file name entry widget """
        fileName = filedialog.askopenfilename(initialdir="/", title="Select river file")
        self.fileNameEntry.delete(0, END)
        self.fileNameEntry.insert(0, fileName)
        return None


    def startSimulation(self):
        """ Start a new simulation and show it in the simulationText area """

        # unlock writes to the simulation text area
        self.simulationText.configure(state=NORMAL)
        self.simulationText.delete("1.0", END) # clear the text area

        try: # the seed is not a mandatory value. Set it to None, if a wrong value is given
            seed = int(self.seedEntry.get())
        except ValueError:
            seed = None

        try:
            if self.option.get() == 0: # Option 0: random river length
                param = int(self.riverLengthEntry.get()) # get river length from field
            else: # Option 1: river file name
                param = self.fileNameEntry.get() # get file name from field
            cycles = int(self.cyclesEntry.get()) # cycles of river evolution
            self.river = River(param, seed) # create a new River from length or file name

        except ValueError:
            # Required fields were not filled or received wrong values
            self.simulationText.insert(END, "Please, fill the required fields accordingly")
            self.simulationText.configure(state=DISABLED)
            return
        except IOError:
            # The file path typed in the file name entry does not exist
            self.simulationText.insert(END, "File not found")
            return

        # start the simulation after the river setup
        self.simulationText.insert(END, "Initial river:\n" + repr(self.river) + "\n\n")
        if cycles > 0:
            for i in range(cycles - 1):
                self.river.updateRiver()
                self.simulationText.insert(END, "After cycle {0:d}:\n".format(i + 1))
                self.simulationText.insert(END, repr(self.river) + "\n\n")
            # last river update. Example: if n = 4, then 4 is the "Final river" line
            self.river.updateRiver()
            self.simulationText.insert(END, "Final river:\n" + repr(self.river) + "\n\n")
        # Enable the menu option to save the river
        self.mainMenu.entryconfig("file", state="normal")
        # lock writes to the simulation text area
        self.simulationText.configure(state=DISABLED)
        return None


    def saveRiver(self):
        """ Save the river to a file """
        try:
            # show a dialog to select the new file name
            fileName = filedialog.asksaveasfilename(title="Save River File", initialdir="/",
                                         filetypes=(("Text File", "*.txt"),("All Files","*.*")),
                                         defaultextension=".txt")
            self.river.write(fileName)
        except Exception as e: # in case the filedialog cancel button is clicked
            print(e)
        return None


    def showHelp(self):
        """ Show use instructions in the simulation text area """
        self.simulationText.configure(state=NORMAL) # unlock writes to the text area
        self.simulationText.delete("1.0", END) # clear the text area
        self.simulationText.insert(END, "River Simulator" +
                                   "\nCycles (required): Integer - number of simulation cycles." +
                                   "\nSeed (optional): Integer - for getting the same result when using an identical river configuration.\n" +
                                   "\nMUTUAL EXCLUSIVE OPTIONS:" +
                                   "\nFile name (required): File path on disk" +
                                   "\nRiver length (required): Integer - the length of a randomly generated river.")
        self.simulationText.configure(state=DISABLED) # lock writes to the text area


# instantiate window. Tk must be passed in order to create the menu bar
janela = Principal(Tk())

# sets window width, height, coordinates and title
janela.master.geometry("800x600+400+70")
janela.master.title("River Simulator")

mainloop()
