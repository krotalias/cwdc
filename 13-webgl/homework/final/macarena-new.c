/*
 *  blobby.c
 *  Blobby Man.
 *  Author : Paulo Roma Cavalcanti em 16/05/95.
 *  Based upon Jim Blim's Corner, IEEE October 1987
 *  Non-commercial use only.
 */
#include <GL/glut.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#if _POSIX_C_SOURCE >= 199309L
#include <time.h>  // for nanosleep
#else
#include <unistd.h>  // for usleep
#endif

#define BACKGROUND 1.0, 1.0, 1.0
#define BLACK 0.0, 0.0, 0.0
#define BLUE 0.0, 0.0, 1.0
#define RED 1.0, 0.0, 0.0
#define GREEN 0.0, 1.0, 0.0
#define GRAY 0.5, 0.5, 0.5
#define LIGHTGRAY 0.2, 0.2, 0.2

#define XAXIX -1.0, 0.0, 0.0
#define YAXIX 0.0, -1.0, 0.0
#define ZAXIX 0.0, 0.0, -1.0

#define PI 3.1415927
#define dcos(ang) cos(PI* ang / 180.0)
#define dsin(ang) sin(PI* ang / 180.0)

typedef struct _worldPoint {
  float x, y, z;
} WorldPoint;

typedef float WorldType;

void macarena(void);
void resetAngles(void);
void redraw(void);

/*===============================  sleep_ms ==================================*/
// cross-platform sleep function
void sleep_ms(int milliseconds) {
#ifdef WIN32
  Sleep(milliseconds);
#elif _POSIX_C_SOURCE >= 199309L
  struct timespec ts;
  ts.tv_sec = milliseconds / 1000;
  ts.tv_nsec = (milliseconds % 1000) * 1000000;
  nanosleep(&ts, NULL);
#else
  usleep(milliseconds * 1000);
#endif
}

static WorldType  // joint angles
    JUMP = 0.0,
    TURN = 0.0,
    FOV = 45.0,                           // field of view
    ZN = 5.17,                            // Z near
    ZF = 10.7,                            // Z far
    XSCR = -0.1, YSCR = 1.6, ZSCR = 7.9,  // screen
    XM = 0.0, YM = 0.0, ZM = 1.75,        // model

    BACK = -90.0, /* x */
    SPIN = -30.0, /* z */
    TILT = 0.0,   /* x */

    ROT = 0.0,   /* z - roda o tronco ao redor da cintura */
    EXTEN = 0.0, /* x - roda o tronco para frente ou para tras */
    BTWIS = 0.0, /* y - roda o tronco lateralmente */

    NOD = -25.0, /* x - roda a cabeca para frente ou para tras */
    NECK = 28.0, /* z - roda a cabeca para a direita ou esquerda */

    RANKL = 0.0, /* x - roda o pe direito para cima ou para baixo */
    LANKL = 0.0, /* x - roda o pe esquerdo para cima ou para baixo */
    RFOOT = 0.0, /* z - rotate right foot sideways */
    LFOOT = 0.0, /* z - rotate left foot sideways */

    RHIP = 105.0,  /* z - roda a perna direita lateralmente em torno */
    ROUT = 13.0,   /* y - de um eixo qualquer */
    RTWIS = -86.0, /* z - roda a perna direita para dentro ou para fora */
    RKNEE = -53.0, /* x - roda a perna direita em torno do joelho */
    RFRONT = 0.0,  /* x - rotate right leg forward or backward */

    RHAND = 0.0, /* y - rotate right hand arount wrist */
    LHAND = 0.0, /* y - rotate left hand arount wrist */

    LHIP = 0.0,   /* z */
    LOUT = 0.0,   /* y */
    LTWIS = 0.0,  /* z */
    LKNEE = 0.0,  /* x */
    LFRONT = 0.0, /* x */

    LSID = -45.0,   /* y - roda o braco esquerdo lateralmente */
    LSHOU = 0.0,    /* x - roda o braco esquerdo para frente ou para tras */
    LATWIS = -90.0, /* z - roda o braco esquerdo para dentro ou para fora */
    LELBO = 90.0,   /* x - roda o braco esquerdo em torno do cotovelo */

    RSID = 112.0,    /* y */
    RSHOU = 40.0,    /* x */
    RATWIS = -102.0, /* z */
    RELBO = 85.0;    /* x */

static int xsize = 512;
static int ysize = 512;

/*=================================  text  ===================================*/

void text(WorldPoint* pt, const char* s) {
  int i, size = strlen(s);

  glRasterPos3f(pt->x, pt->y, pt->z);
  for (i = 0; i < size; ++i)
    glutBitmapCharacter(GLUT_BITMAP_TIMES_ROMAN_24, s[i]);
}

/*===============================  pldraw  ===================================*/

void pldraw(int n, WorldPoint* pts) {
  int i;
  glBegin(GL_LINE_STRIP);
  for (i = 0; i < n; ++i) glVertex3f(pts[i].x, pts[i].y, pts[i].z);
  glEnd();
}

/*==================================  pnt  ===================================*/

void pnt(WorldPoint* pt) {
  glBegin(GL_POINTS);
  glVertex3f(pt->x, pt->y, pt->z);
  glEnd();
}

/*=========================  GPlane  =========================================*/
void GPlane(void) {
  WorldPoint buf[2];
  WorldType p, b = 2.0;
  int i;

  buf[0].z = buf[1].z = 0.0;
  for (i = -2; i < 3; i++) {
    p = (WorldType)i;
    if (i == 0) {
      glColor3d(BLACK);
      b = 2.5;
    } else {
      glColor3d(GREEN);
      b = 2.0;
    }
    buf[0].x = -b;
    buf[0].y = p;
    buf[1].x = b;
    buf[1].y = p;
    pldraw(2, buf);
    buf[0].x = p;
    buf[0].y = -b;
    buf[1].x = p;
    buf[1].y = b;
    pldraw(2, buf);
  }
  glColor3d(BLACK);
  buf[0].x = 0.0;
  buf[0].y = 2.0;
  buf[1].x = 0.0;
  buf[1].y = 2.0;
  buf[1].z = 4.0;
  pldraw(2, buf);
  glPointSize(2);
  for (i = 1; i < 5; i++) {
    buf[0].x = 0.0;
    buf[0].y = 2.0;
    buf[0].z = (WorldType)i;
    pnt(buf);
  }
  buf[0].x = 2.5;
  buf[0].y = 0.0;
  buf[0].z = 0.0;
  text(buf, " X");
  buf[0].x = 0.0;
  buf[0].y = 2.5;
  buf[0].z = 0.0;
  text(buf, " Y");
  buf[0].x = 0.0;
  buf[0].y = 2.0;
  buf[0].z = 4.0;
  text(buf, " Z");
}

/*=========================  circ  ===========================================*/
void circ(WorldType xc, WorldType yc, WorldType zc, WorldType radius,
          int plane) {
#define nseg 12
  int i;
  WorldType c, s, ang = 360.0 / (float)nseg;
  WorldPoint p[2], a = {0.0, 0.0, 0.0};

  p[0] = p[1] = a;
  switch (plane) {
    case 1:
      p[0].x = xc + radius;
      p[0].y = yc;
      a.x = radius;
      break;
    case 2:
      p[0].x = xc + radius;
      p[0].z = zc;
      a.x = radius;
      break;
    case 3:
      p[0].y = yc + radius;
      p[0].z = zc;
      a.y = radius;
      break;
  }

  c = dcos(ang);
  s = dsin(ang);
  WorldType x, y, z;
  for (i = 1; i <= nseg; i++) {
    switch (plane) {
      case 1: /* xy */
        p[1].x = xc + (x = (a.x * c - a.y * s));
        p[1].y = yc + (y = (a.x * s + a.y * c));
        break;
      case 2: /* xz */
        p[1].x = xc + (x = (a.x * c - a.z * s));
        p[1].z = zc + (z = (a.x * s + a.z * c));
        break;
      case 3: /* yz */
        p[1].y = yc + (y = (a.y * c - a.z * s));
        p[1].z = zc + (z = (a.y * s + a.z * c));
        break;
    }
    a.x = x;
    a.y = y;
    a.z = z;
    pldraw(2, p);
    p[0] = p[1];
  }
}

/*=========================  sphere  =========================================*/
void sphere(void) {
  circ(0.0, 0.0, 0.0, 1.0, 1);
  circ(0.0, 0.0, 0.0, 1.0, 2);
  circ(0.0, 0.0, 0.0, 1.0, 3);
}

/*=========================  head  ===========================================*/
void head(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, 0.4);
  glScaled(0.2, 0.23, 0.3);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, -0.255, 0.42);
  glScaled(0.035, 0.075, 0.035);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.0, 0.07);
  glScaled(0.065, 0.065, 0.14);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, -0.162, 0.239);
  glScaled(0.0533, 0.0508, 0.0506);
  sphere();
  glPopMatrix();
}

/*=========================  uparm  ==========================================*/
void uparm(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, -0.275);
  glScaled(0.09, 0.09, 0.275);
  sphere();
  glPopMatrix();
}

/*=========================  lowarm  =========================================*/
void lowarm(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, -0.25);
  glScaled(0.08, 0.08, 0.25);
  sphere();
  glPopMatrix();
}

/*=========================  hand  ===========================================*/
void hand(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, -0.116);
  glScaled(0.052, 0.091, 0.155);
  sphere();
  glPopMatrix();
}

/*=========================  thigh  ==========================================*/
void thigh(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, -0.425);
  glScaled(0.141, 0.141, 0.425);
  sphere();
  glPopMatrix();
}

/*=========================  calf  ===========================================*/
void calf(void) {
  glPushMatrix();
  glScaled(0.05, 0.05, 0.05);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.0, -0.425);
  glScaled(0.1, 0.1, 0.425);
  sphere();
  glPopMatrix();
}

/*=========================  foot  ===========================================*/
void foot(void) {
  glPushMatrix();
  glScaled(0.05, 0.04, 0.04);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.05, -0.05);
  glScaled(0.04, 0.04, 0.04);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, -0.15, -0.05);
  glRotated(10.0, XAXIX);
  glScaled(0.08, 0.19, 0.05);
  sphere();
  glPopMatrix();
}

/*=========================  leftarm  =======================================*/
void leftarm(void) {
  glPushMatrix();
  uparm();
  glTranslated(0.0, 0.0, -0.55);
  glRotated(LELBO, XAXIX);
  lowarm();
  glTranslated(0.0, 0.0, -0.5);
  glRotated(LHAND, YAXIX);
  hand();
  glPopMatrix();
}

/*=========================  rightarm  ======================================*/
void rightarm(void) {
  glPushMatrix();
  uparm();
  glTranslated(0.0, 0.0, -0.55);
  glRotated(RELBO, XAXIX);
  lowarm();
  glTranslated(0.0, 0.0, -0.5);
  glRotated(RHAND, YAXIX);
  hand();
  glPopMatrix();
}

/*=========================  leftleg  =======================================*/
void leftleg(void) {
  glPushMatrix();
  glRotated(LFRONT, XAXIX);
  glRotated(LHIP, ZAXIX);
  glRotated(LOUT, YAXIX);
  glRotated(-LHIP, ZAXIX);
  glRotated(LTWIS, ZAXIX);
  thigh();
  glTranslated(0.0, 0.0, -0.85);
  glRotated(LKNEE, XAXIX);
  calf();
  glTranslated(0.0, 0.0, -0.84);
  glRotated(LANKL, XAXIX);
  glRotated(LFOOT, ZAXIX);
  foot();
  glPopMatrix();
}

/*=========================  rightleg  =======================================*/
void rightleg(void) {
  glPushMatrix();
  glRotated(RFRONT, XAXIX);
  glRotated(RHIP, ZAXIX);
  glRotated(ROUT, YAXIX);
  glRotated(-RHIP, ZAXIX);
  glRotated(RTWIS, ZAXIX);
  thigh();
  glTranslated(0.0, 0.0, -0.85);
  glRotated(RKNEE, XAXIX);
  calf();
  glTranslated(0.0, 0.0, -0.84);
  glRotated(RANKL, XAXIX);
  glRotated(RFOOT, ZAXIX);
  foot();
  glPopMatrix();
}

/*=========================  shoulder  =======================================*/
void shoulder(void) {
  glPushMatrix();
  glScaled(0.45, 0.153, 0.12);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.0, 0.153);
  glRotated(NOD, XAXIX);
  glRotated(NECK, ZAXIX);
  head();
  glPopMatrix();

  glPushMatrix();
  glTranslated(-0.45, 0.0, 0.0);
  glRotated(LSID, YAXIX);
  glRotated(LSHOU, XAXIX);
  glRotated(LATWIS, ZAXIX);
  leftarm();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.45, 0.0, 0.0);
  glRotated(RSID, YAXIX);
  glRotated(RSHOU, XAXIX);
  glRotated(RATWIS, ZAXIX);
  rightarm();
  glPopMatrix();
}

/*=========================  body  ===========================================*/
void body(void) {
  glPushMatrix();
  glTranslated(0.0, 0.0, 0.62);
  glScaled(0.306, 0.21, 0.5);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.0, 1.0);
  glRotated(EXTEN, XAXIX); /* the shoulder rotates twice */
  glRotated(BTWIS, YAXIX);
  glRotated(ROT, ZAXIX);
  shoulder();
  glPopMatrix();
}

/*=========================  TORSO  ==========================================*/
void TORSO(void) {
  glColor3d(RED);
  glPushMatrix();
  glTranslated(-0.178, 0.0, 0.0);
  leftleg();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.178, 0.0, 0.0);
  rightleg();
  glPopMatrix();

  glPushMatrix();
  glTranslated(0.0, 0.0, 0.08);
  glScaled(0.275, 0.152, 0.153);
  sphere();
  glPopMatrix();

  glPushMatrix();
  glRotated(EXTEN, XAXIX);
  glRotated(BTWIS, YAXIX);
  glRotated(ROT, ZAXIX);
  body();
  glPopMatrix();
}

/*=========================  reshape  =======================================*/

void reshape(int w, int h) {
  xsize = w;
  ysize = h;
  glViewport(0, 0, w, h);
}

/*=========================  printHelp  ===============================*/

void printHelp(void) {
  printf("Type 'q' to exit.\n");
  printf("Type 'h' for help.\n");
  printf("Type 'b' to spin around +Z.\n");
  printf("Type 'B' to spin around -Z.\n");
  printf("Type 'm' to dance the Macarena.\n\n");
}

/*=========================  keyboardHandler  ===============================*/

void keyboardHandler(unsigned char key, int x, int y) {
  switch (key) {
    case 'h':
      printHelp();
      break;
    case 'q':
      exit(0);
      break;
    case 'b':
      SPIN += 15;
      redraw();
      break;
    case 'B':
      SPIN -= 15;
      redraw();
      break;
    case 'm':
      macarena();
      break;
  }
}

/*=========================  mouseHandler  ==================================*/

void mouseHandler(int button, int state, int x, int y) {
  switch (button) {
    case GLUT_LEFT_BUTTON:
      break;
    case GLUT_MIDDLE_BUTTON:
      break;
    case GLUT_RIGHT_BUTTON:
      break;
  }
}

/* ==================== initView =====================*/

void initView(void) {
  WorldPoint vp = {0.0, 0.0, 0.0}, ref = {0.0, 0.0, 1.0}, up = {0.0, -1.0, 0.0};

  glMatrixMode(GL_PROJECTION);
  glLoadIdentity();
  glColor3d(BLACK);
#if 0
 vp.z = 2.0;
 n.x = 0.0; n.y = 1.0; n.z = 0.0; 
 up.x = 0.0; up.y = 0.0; up.z = 1.0;
 ref.x = vp.x+n.x; ref.y = vp.y+n.y; ref.z = vp.z+n.z;
 glOrtho ( p1.x, p2.x, p1.y, p2.y, p1.z, p2.z );
 glMatrixMode ( GL_MODELVIEW );
 glLoadIdentity ();
 gluLookAt ( vp.x, vp.y, vp.z, ref.x, ref.y, ref.z, up.x, up.y, up.z );
#else
  // glFrustum ( p1.x, p2.x, p1.y, p2.y, ZN, ZF );
  gluPerspective(FOV, 1.0, ZN, ZF);
  glMatrixMode(GL_MODELVIEW);
  glLoadIdentity();
  gluLookAt(vp.x, vp.y, vp.z, ref.x, ref.y, ref.z, up.x, up.y, up.z);
#endif
}

/* ==================== displayStuff =====================*/

void displayStuff(void) {
  initView();
  glTranslated(XSCR, YSCR, ZSCR);
  glRotated(BACK, XAXIX);
  glRotated(SPIN, ZAXIX);
  glRotated(TILT, XAXIX);
  GPlane();
  glTranslated(XM, YM, ZM);

  glTranslated(0, 0, JUMP);
  glRotated(TURN, ZAXIX);

  TORSO();
}

/*=========================  init  ===========================================*/

void init(void) {
  xsize = 512;
  ysize = 512;
  glClearColor(1.0, 1.0, 1.0, 0.0);
}

/*=========================  redraw  =========================================*/

void redraw() {
  glClear(GL_COLOR_BUFFER_BIT);
  displayStuff();
  glFlush();
}

/*========================= resetAngles ======================================*/

// put Blobby standing still with hands on his hip
void resetAngles(void) {
  TURN = 0.0;
  JUMP = 0.0;
  ROT = 0.0;   /* z - rotate torso around hip */
  EXTEN = 0.0; /* x - rotate torso forward or backward */
  BTWIS = 0.0; /* y - rotate torso sideways */

  NOD = 0.0;  /* x - rotate head forward or backward */
  NECK = 0.0; /* z - rotate head sideways */

  RANKL = 0.0; /* x - rotate right foot up or down */
  LANKL = 0.0; /* x - rotate left foot up or down */
  RFOOT = 0.0; /* z - rotate right foot sideways */
  LFOOT = 0.0; /* z - rotate left foot sideways */

  RHIP = 0.0;   /* z - rotate right leg sideways around */
  ROUT = 0.0;   /* y - any axis */
  RTWIS = 0.0;  /* z - rotate right leg in or out */
  RKNEE = 0.0;  /* x - rotate right leg around the knee */
  RFRONT = 0.0; /* x - rotate right leg forward or backward */

  RHAND = 0.0; /* y - rotate right hand around wrist */
  LHAND = 0.0; /* y - rotate left hand around wrist */

  LHIP = 0.0;   /* z */
  LOUT = 0.0;   /* y */
  LTWIS = 0.0;  /* z */
  LKNEE = 0.0;  /* x */
  LFRONT = 0.0; /* x */

  LSID = -45.0;   /* y - roda o braco esquerdo lateralmente */
  LSHOU = 0.0;    /* x - roda o braco esquerdo para frente ou para tras */
  LATWIS = -90.0; /* z - roda o braco esquerdo para dentro ou para fora */
  LELBO = 90.0;   /* x - roda o braco esquerdo em torno do cotovelo */

  RSID = 45.0;    /* y */
  RSHOU = 0.0;    /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0;  /* x */
}

/*=========================  delay ===========================================*/

void delay(void) {
  redraw();
#if 0
	long int i;
 	for(i=0; i<25000000; i++){}
#else
  sleep_ms(60);
#endif
}

void delay2(void) {
  redraw();
#if 0
	long int i;
 	for(i=0; i<1000000; i++){}
#else
  sleep_ms(10);
#endif
}

/*========================= macarena =========================================*/

void macarena(void) {
  int i, j;
  resetAngles();
  for (j = 0; j <= 3; j++) {
    // Bracos para frente esticando
    for (i = 0; i <= 3; ++i) {
      RELBO += 10;
      RATWIS -= 6.5;
      RSHOU += 9;
      LANKL -= 5;
      LFRONT += 5.5;
      LKNEE -= 8;
      BTWIS += 1;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      RELBO += 10;
      RATWIS -= 6.5;
      RSHOU += 9;
      LANKL += 5;
      LFRONT -= 5.5;
      LKNEE += 8;
      BTWIS -= 1;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LELBO -= 10;
      LATWIS += 6.5;
      LSHOU += 9;
      RANKL -= 5;
      RFRONT += 5.5;
      RKNEE -= 8;
      BTWIS -= 1;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LELBO -= 10;
      LATWIS += 6.5;
      LSHOU += 9;
      RANKL += 5;
      RFRONT -= 5.5;
      RKNEE += 8;
      BTWIS += 1;
      delay();
    }

    // Dobra os bracos
    for (i = 0; i <= 3; ++i) {
      RELBO -= 12;
      BTWIS += 1;
      LANKL -= 5;
      LFRONT += 5.5;
      LKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      RELBO -= 12;
      BTWIS -= 1;
      LANKL += 5;
      LFRONT -= 5.5;
      LKNEE += 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LELBO += 12;
      BTWIS -= 1;
      RANKL -= 5;
      RFRONT += 5.5;
      RKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LELBO += 12;
      BTWIS += 1;
      RANKL += 5;
      RFRONT -= 5.5;
      RKNEE += 8;
      delay();
    }

    // poe as maos na cabeca
    for (i = 0; i <= 3; ++i) {
      RSHOU += 5;
      RATWIS -= 9;
      RHAND += 2.5;
      BTWIS += 1;
      LANKL -= 5;
      LFRONT += 5.5;
      LKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      RSHOU += 5;
      RATWIS -= 9;
      RHAND += 2.5;
      BTWIS -= 1;
      LANKL += 5;
      LFRONT -= 5.5;
      LKNEE += 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LSHOU += 5;
      LATWIS += 9;
      LHAND += 2.5;
      BTWIS -= 1;
      RANKL -= 5;
      RFRONT += 5.5;
      RKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LSHOU += 5;
      LATWIS += 9;
      LHAND += 2.5;
      BTWIS += 1;
      RANKL += 5;
      RFRONT -= 5.5;
      RKNEE += 8;
      delay();
    }

    // volta para posicao inicial
    for (i = 0; i <= 3; ++i) {
      RSHOU -= 14;
      RATWIS += 15.5;
      RHAND -= 2.5;
      RELBO += 2;
      BTWIS += 1;
      LANKL -= 5;
      LFRONT += 5.5;
      LKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      RSHOU -= 14;
      RATWIS += 15.5;
      RHAND -= 2.5;
      RELBO += 2;
      BTWIS -= 1;
      LANKL += 5;
      LFRONT -= 5.5;
      LKNEE += 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LSHOU -= 14;
      LATWIS -= 15.5;
      LHAND -= 2.5;
      LELBO -= 2;
      BTWIS -= 1;
      RANKL -= 5;
      RFRONT += 5.5;
      RKNEE -= 8;
      delay();
    }
    for (i = 0; i <= 3; ++i) {
      LSHOU -= 14;
      LATWIS -= 15.5;
      LHAND -= 2.5;
      LELBO -= 2;
      BTWIS += 1;
      RANKL += 5;
      RFRONT -= 5.5;
      RKNEE += 8;
      delay();
    }

    // comeca o pulo
    for (i = 0; i <= 7; ++i) {
      JUMP -= 1.0 / 30;
      LFRONT += 4.5;
      RFRONT += 4.5;
      RANKL += 3;
      LANKL += 3;
      RKNEE -= 8;
      LKNEE -= 8;
      LELBO -= 5.5;
      RELBO += 5.5;
      LSID += 4;
      RSID -= 4;
      RSHOU -= 3;
      LSHOU -= 3;
      RATWIS -= 10;
      LATWIS += 10;
      EXTEN -= 2;
      delay2();
    }

    // levanta o corpo esticando as pernas, abrindo os bracos e
    // levantando o tronco
    for (i = 0; i <= 7; ++i) {
      JUMP += 1.0 / 30;
      LFRONT -= 4.5;
      RFRONT -= 4.5;
      RANKL -= 5;
      LANKL -= 5;
      RKNEE += 8;
      LKNEE += 8;
      EXTEN += 1;
      LELBO += 4;
      RELBO -= 4;
      RSHOU += 3;
      LSHOU += 3;
      delay2();
    }

    // sai do chao girando
    for (i = 0; i <= 7; ++i) {
      JUMP += 1.0 / 10;
      RANKL -= 5;
      LANKL -= 5;
      EXTEN += 1;
      TURN -= 5.625;
      NOD += 2;
      delay2();
    }

    // volta para o chao dobrando os pes girando
    for (i = 0; i <= 7; ++i) {
      JUMP -= 1.0 / 10;
      RANKL += 5;
      LANKL += 5;
      NOD -= 2;
      TURN -= 5.625;
      delay2();
    }

    // amortece
    for (i = 0; i <= 7; ++i) {
      JUMP -= 1.0 / 50;
      LFRONT += 3;
      RFRONT += 3;
      RANKL += 5;
      LANKL += 5;
      RKNEE -= 6;
      LKNEE -= 6;
      EXTEN -= 1;
      delay2();
    }

    // sobe o corpo, voltando pro lugar
    for (i = 0; i <= 7; ++i) {
      JUMP += 1.0 / 50;
      LFRONT -= 3;
      RFRONT -= 3;
      RANKL -= 3;
      LANKL -= 3;
      RKNEE += 6;
      LKNEE += 6;
      LELBO += 1.5;
      RELBO -= 1.5;
      LSID -= 4;
      RSID += 4;
      RATWIS += 10;
      LATWIS -= 10;
      EXTEN += 1;
      delay2();
    }
  }
}

/*=========================  main  ===========================================*/
int main(int argc, char* argv[]) {
  glutInit(&argc, argv);
  glutInitDisplayMode(GLUT_SINGLE | GLUT_RGBA);
  glutInitWindowPosition(0, 0);
  glutInitWindowSize(xsize, ysize);
  glutCreateWindow("Blobby Man");

  init();

  glutMouseFunc(mouseHandler);
  glutKeyboardFunc(keyboardHandler);
  glutDisplayFunc(redraw);
  glutReshapeFunc(reshape);

  glutMainLoop();

  return 1;
}
