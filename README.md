# code-tests
General code testing



WebGL stuff:


Q28. How do I generate a rotation matrix in the X-axis?
-------------------------------------------------------

  Use the 4x4 matrix:

         |  1  0       0       0 |
     M = |  0  cos(A) -sin(A)  0 |
         |  0  sin(A)  cos(A)  0 |
         |  0  0       0       1 |


Q29. How do I generate a rotation matrix in the Y-axis?
-------------------------------------------------------

  Use the 4x4 matrix:

         |  cos(A)  0   sin(A)  0 |
     M = |  0       1   0       0 |
         | -sin(A)  0   cos(A)  0 |
         |  0       0   0       1 |


Q30. How do I generate a rotation matrix in the Z-axis?
-------------------------------------------------------

  Use the 4x4 matrix:

         |  cos(A)  -sin(A)   0   0 |
     M = |  sin(A)   cos(A)   0   0 |
         |  0        0        1   0 |
         |  0        0        0   1 |



#######################
### TRANSLATION MATRICES
#######################

Q41. What is a translation matrix?
----------------------------------

  A translation matrix is used to position an object within 3D space
  without rotating in any way. Translation operations using matrix
  multiplication can only be performed using 4x4 matrices.


  If the translation is defined by the vector [X Y Z ], then the 4x4
  matrix to implement translation is as follows:

        | 1  0  0  X |
        |            |
        | 0  1  0  Y |
    M = |            |
        | 0  0  1  Z |
        |            |
        | 0  0  0  1 |