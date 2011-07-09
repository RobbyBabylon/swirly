import com.cycling74.max.Atom;
import com.cycling74.max.MaxObject;

import java.awt.AWTException;
import java.awt.Robot;

public class ring_keyPress extends MaxObject {
  private static final String[] INLET_ASSIST = { "String: key to be stroked" };
  private static final String[] OUTLET_ASSIST = { "outlet 1 help" };

  public ring_keyPress(Atom[] paramArrayOfAtom) {
    post("here!\n");
    declareInlets(new int[] { 15 });
    declareOutlets(NO_OUTLETS);
    createInfoOutlet(false);

    setInletAssist(INLET_ASSIST);
    setOutletAssist(OUTLET_ASSIST);
  }

  public void bang() {}

  public void inlet(int paramInt)
  {
		post("working!\n");
        try
          {
            Robot localRobot = new Robot();
            localRobot.keyPress(paramInt);
            localRobot.keyRelease(paramInt);
          } catch (AWTException localAWTException) {
          localAWTException.printStackTrace();
        }
  }

  public void inlet(float paramFloat)
  {
  }

  public void list(int[] paramArrayOfInt)
  {
    try
      {
        Robot localRobot = new Robot();
        localRobot.setAutoWaitForIdle(true);
        for (int i = 0; i < paramArrayOfInt.length; ++i) {
          if (paramArrayOfInt[i] != 1)
            localRobot.keyPress(paramArrayOfInt[i]);
          else {
            post("input was not integer or 1");
          }
        }
        for (int i = 0; i < paramArrayOfInt.length; ++i)
          if (paramArrayOfInt[i] != 1)
            localRobot.keyRelease(paramArrayOfInt[i]);
      }
    catch (AWTException localAWTException)
      {
        localAWTException.printStackTrace();
      }
  }
}

