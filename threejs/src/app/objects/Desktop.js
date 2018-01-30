define(['threejs'], function (three) {

  /*################ Utility #####################*/
  var radiansMultiplier = Math.PI / 180;

  function toRadians(deg) {
    return deg * radiansMultiplier;
  }


  /*################ Class Export #####################*/
  function Desktop(cfg) {
    this.setCfg(cfg);
  }

  Desktop.prototype = {
    setCfg: function (c) {
      if (!c
        || !c.edgeRadius
        || !c.cornerRadius
        || !c.edgeSubdivisions
        || !c.cornerSubdivisions
        || c.width !== parseFloat(c.width)
        || c.height !== parseFloat(c.height)
        || c.depth !== parseFloat(c.depth)
      ) {
        throw new Error('Cannot initialize Desktop model.' +
                        'Config is missing or has invalid property/ies.');
      }
      this.cfg = c;
    },

    getMesh: function(material) {
      /*this.meshObject = new three.Points(
        this.computeMeshGeometry(),
        material
      );*/
      this.geometry = this._generateGeometry();
      console.log(this.geometry);
      this.meshObject = new three.Mesh(
      //this.meshObject = new three.Mesh(
        this.geometry,
        material
      );

      return this.meshObject;
    },

    setWidth: function(val) {
      // TODO: type check this
      var dif = val - this.cfg.width;
      this.cfg.width = val;
      var verts = this.geometry.vertices;
      var size = verts.length / 4;

      this._doPropChange(
        verts.slice(size, size + size * 2),
        new three.Matrix4().setPosition(new three.Vector3(-dif * .5, 0, 0))
      );

      this._doPropChange(
        (verts.slice(0, size)).concat(verts.slice(size * 3, verts.length)),
        new three.Matrix4().setPosition(new three.Vector3(dif * .5, 0, 0))
      );
    },

    setHeight: function(val) {
      // TODO: type check this
      var dif = val - this.cfg.height;
      this.cfg.height = val;
      var verts = this.geometry.vertices;
      var size = this.cfg.edgeSubdivisions + 2;
      var list = [];
      var count = 0;

      while (count < verts.length) {
        list = list.concat(verts.slice(count, count + size));
        count += size * 2;
      }

      this._doPropChange(
        list,
        new three.Matrix4().setPosition(new three.Vector3(0, dif, 0))
      );
    },

    setDepth: function(val) {
      // TODO: type check this
      var dif = val - this.cfg.depth;
      this.cfg.depth = val;
      var verts = this.geometry.vertices;

      this._doPropChange(
        verts.slice(0, verts.length / 2),
        new three.Matrix4().setPosition(new three.Vector3(0, 0, -dif * .5))
      );

      this._doPropChange(
        (verts.slice(verts.length / 2, verts.length)),
        new three.Matrix4().setPosition(new three.Vector3(0, 0, dif * .5))
      );
    },

    _doPropChange: function(verts, matrix) {
      for(var i = 0, len = verts.length; i < len; i++) {
        verts[i].applyMatrix4(matrix);
      }
      this.meshObject.geometry.verticesNeedUpdate = true;
    },

    /**
     * Calculates the edge shape that will be used to extrude the entire
     * geometry of the desk. Returns an array of alternating x, y, z coordinates
     * so it'll be 3x the values
     *
     * @returns {three.Geometry}
     */
    _generateGeometry: function () {
      var cfg = this.cfg;
      var geo = new three.Geometry();
      var angleStart = 90;
      var angleEnd = 0;
      var angleRange = angleEnd - angleStart;
      var subDivs = cfg.edgeSubdivisions + 2;
      var edgeRadius = cfg.edgeRadius;
      // Top arc of our curve
      var arc1 = [];
      var arc2 = [];
      var vertices = [];
      var angleRadians, coords, vec, vecClone, extrPath;

      // Initial setup for the extrusion matrix should have it at the first
      // corner. We will start with the back-right corner
      // Rotations will happen later
      var positionMatrix = new three.Matrix4()
        .setPosition(new three.Vector3(0, (cfg.height * .5) - edgeRadius, 0));
      var adjustmentMatrix = new three.Matrix4()
        .setPosition(new three.Vector3(0, cfg.height * .5, 0));
      var rotationMatrix = new three.Matrix4();
      var extrusionMatrix = new three.Matrix4();

      // First, loop through and build the extrusion shape. This is the
      // 'silhouette' of the edge of the desk that will be copied around
      // to create the outer surfaces
      for (var i = 0; i < subDivs; i++) {
        angleRadians = toRadians((i / (subDivs - 1) * angleRange) + angleStart);
        coords = this._getCurveCoords(edgeRadius, angleRadians);
        vec = new three.Vector3(coords[0], coords[1], 0)
          .applyMatrix4(positionMatrix);
        vecClone = vec.clone().setComponent(1, -vec.y);
        vec.applyMatrix4(adjustmentMatrix);
        vecClone.applyMatrix4(adjustmentMatrix);
        arc1.push(vec);
        // Builds inverse array with inverted Y coord (mirrors it)
        arc2.unshift(vecClone);
      }
      extrPath = arc1.concat(arc2);

      // Now we have our extrusion path. The intended origin (center point for
      // transforms) sits between the first and last points at 0,0,0
      // The extrusion path itself creates a D shape without the vertical
      // part of the D, extending in a positive-x direction away from the
      // Y axis, and vertically centered against the x axis. The entire path
      // has a z value of 0
      //
      // Next we need to make a translation/rotation matrix that will copy and
      // position this extrusion path around the actual locations for the
      // desk edge

      // Build extrusion matrix and extrude the full set of surface points
      //  1) Using the original extrusion path positioning described above,
      //     the extrusion matrix will move that point to each corner of the
      //     desk minus the radius of the corner itself. This will place the
      //     outer edge of the copied extrusion path points right where they
      //     need to go, along the corner radius edge
      //  2) Next, we need to copy repeatedly while multiplying our matrix
      //     against a rotation matrix to attain the curve of all of the new
      //     points for the full corner
      //  3) Finally, we need to repeat this process until we've completed all
      //     corners. Rather than repeating it for each corner, we can take all
      //     existing points and translate/rotate them as a group, requiring
      //     only 2 more operations: one to copy the first corner to the second
      //     corner, and then one to copy that entire side to the other side.

      subDivs = cfg.cornerSubdivisions + 2;
      positionMatrix.setPosition(
        new three.Vector3(cfg.width * .5, 0, -cfg.depth * .5)
      );
      var rotStep = 90 / (cfg.cornerSubdivisions + 1);
      var currRotation = 0;

      // Loop will clone every point on the extrusion path that we built to the
      // new target location using the extrusion matrix. Upon each iteration
      // the rotation angle will be modified and a new set will be copied.
      // Create first corner
      for (i = 0; i < subDivs; i++) {
        // At the beginning of each loop rotate the extrusion matrix
        rotationMatrix.makeRotationY(toRadians(currRotation).toFixed(5));
        extrusionMatrix.multiplyMatrices(positionMatrix, rotationMatrix);

        // First and last points of these overlap. Need to not place duplicates
        for (var j = i === 0 ? 0 : 1,
                 len = i === 0 ? extrPath.length : extrPath.length - 1;
             j < len;
             j++) {
          vertices.push(
            extrPath[j]
              .clone()
              .applyMatrix4(extrusionMatrix)
          );
        }

        currRotation += rotStep;
      }

      // Duplicate the first corner to the second corner:
      //  - Translate back to origin
      //  - Rotate by 90 degrees
      //  - Translate to opposite corner position
      var tempVectors = [];
      positionMatrix.setPosition(
        new three.Vector3(-cfg.width * .5, 0, -cfg.depth * .5)
      );
      rotationMatrix.makeRotationY(toRadians(90));
      extrusionMatrix.multiplyMatrices(positionMatrix, rotationMatrix);
      positionMatrix.setPosition(
        new three.Vector3(-cfg.width * .5, 0, cfg.depth * .5)
      );
      extrusionMatrix.multiply(positionMatrix);

      for (i = 0, len = vertices.length; i < len; i++) {
        tempVectors.push(vertices[i].clone().applyMatrix4(extrusionMatrix));
      }
      vertices = vertices.concat(tempVectors);

      // Duplicate and mirror back-side to front side
      //  - Translate back to origin. The entire back side only needs a z-axis
      //    positional adjustment since it is already centered on the x-axis
      //  - Perform a 180 degree rotation
      //  - Translate to the front position
      positionMatrix.setPosition(new three.Vector3(0, 0, cfg.depth * .5));
      rotationMatrix.makeRotationY(toRadians(180));
      extrusionMatrix.multiplyMatrices(positionMatrix, rotationMatrix);
      positionMatrix.setPosition(new three.Vector3(0, 0, cfg.depth * .5));
      extrusionMatrix.multiply(positionMatrix);
      tempVectors = [];

      for (i = 0, len = vertices.length; i < len; i++) {
        tempVectors.push(vertices[i].clone().applyMatrix4(extrusionMatrix));
      }
      vertices = vertices.concat(tempVectors);

      geo.setFromPoints(vertices);
      this._computeFaces(vertices, geo);

      geo.computeFaceNormals();
      //geo.computeVertexNormals();

      return geo;
    },

    _computeFaces: function(verts, geo) {
      /*
      var faces = geo.faces;
      // Get curr column, next column, prev column
      // Loop through curr column and create faces with:
      //  - currCol[i], currCol[i + 1], nextCol[i]
      //  - currCol[i], prevCol[i + 1], currCol[i + 1}
      var colSize = (this.cfg.edgeSubdivisions + 2) * 2;
      var currColIdx, nextColIdx, prevColIdx, i, idx;
      var iteration = 0;
      var loop = 0;

      while (loop < verts.length) {
        currColIdx = iteration * colSize;
        nextColIdx = currColIdx + colSize;
        prevColIdx = currColIdx - colSize;

        if (prevColIdx < 0) {
          prevColIdx = verts.length - colSize;
        }

        if (nextColIdx >= verts.length) {
          nextColIdx = 0;
        }

        // Skips the last vertex in each column
        for (i = 1; i < colSize - 1; i++){
          idx = currColIdx + i;
          // Column tops/bottoms form triangles, not squares
          faces.push(new three.Face3(idx, idx + 1, nextColIdx + i));
          faces.push(new three.Face3(idx, idx + i + 1, prevColIdx + 1));

          loop++;
        }


        loop++;
        iteration++;
      }*/
      // Loop through each column
      //  - IF this is the first column and the first vertex in that column:
      //    - Set the current 'top corner' to the first vertex in this column
      //    - Set the current 'bottom corner' to the last vertex in this column
      //    - Skip the first vertex to get to the true first column vertex
      //  - IF this is the FIRST vertex in a column
      //    - IF this is NOT the last column in this set:
      //      - Create top face using the first vertex in the next column, the
      //        currently set 'top corner', and this vertex
      //    - ELSE IF this IS the last column in the set:
      //      - Create a face using the first vertex in the next set (the top
      //        vertex of the set) and the first vertex in the current set (the
      //        'top corner' of the current set), and the current vertex
      //      - Create a face using the first vertex in the next set (the top
      //        vertex of the set), the second vertex in the next set (the
      //        first column vertex in the next set), and the current vertex
      //  - ELSE IF this is the LAST vertex in a column:
      //    - IF this is NOT the last column in this set:
      //      - Create bottom face using the last vertex in the next column, the
      //        currently set 'bottom corner', and this vertex
      //    - ELSE IF this is the last column in the set:
      //      - Create a face using the last vertex in first column of the next
      //        set (the 'bottom corner' of the set), the last vertex in the
      //        current set (the
      //        'top corner' of the current set), and the current vertex
      //      - Create a face using the first vertex in the next set (the top
      //        vertex of the set), the second vertex in the next set (the
      //        first column vertex in the next set), and the current vertex
      //
      // If !(colcount % subdivisions), skip a point (it's the top point) and
      // set that point to the current top point. Also set the bottom point now.
      //
      // End of loop:
      //  - Augment column count
      var faces = geo.faces;
      var currPt = 0;
      var nextColIdx = 0;
      var nextGroupIdx = 0;
      var ptsPerCol = (this.cfg.edgeSubdivisions + 1) * 2;
      var colsPerGroup = this.cfg.cornerSubdivisions + 2;
      var ptsPerGroup = ptsPerCol * colsPerGroup;
      var topCorner, bottomCorner, lastColIdx, colCount, isFirstCol,
        isLastCol, currGrpIdx;

      //while (currPt < verts.length) {
      while (currPt < 86*3.5) {
        // Set up new group
        if (currPt === nextGroupIdx) {
          console.log('##### NEW COLUMN #####');
          isLastCol = 0;
          isFirstCol = 1;
          currGrpIdx = currPt;
          nextGroupIdx += ptsPerGroup + 2;
          nextGroupIdx = nextGroupIdx >= verts.length ? 0 : nextGroupIdx;
          topCorner = currPt;
          bottomCorner = currGrpIdx + ptsPerCol + 1;
          lastColIdx = currGrpIdx + (ptsPerCol * (colsPerGroup - 1) + 2);
          console.log('isFirstCol', isFirstCol);
          console.log('isLastCol', isLastCol);
          console.log('ptsPerCol', ptsPerCol);
          console.log('colsPerGroup', colsPerGroup);
          console.log('ptsPerGroup', ptsPerGroup);
          console.log('currGrpIdx', currGrpIdx);
          console.log('nextGroupIdx', nextGroupIdx);
          console.log('topCorner', topCorner);
          console.log('bottomCorner', bottomCorner);
          console.log('lastColIdx', lastColIdx);
          console.log('Skip top corner');
          currPt++;
        }

        if (currPt === lastColIdx) {
          isLastCol = 0;
        }

        colCount = 0;
        nextColIdx += ptsPerCol + (isFirstCol ? 2 : 0);
        nextColIdx = nextColIdx >= verts.length ? 1 : nextColIdx;

        while (colCount < ptsPerCol - 1) {
          // This is our 'standard' case. Most points will follow this
          faces.push(new three.Face3(
            currPt,
            currPt + 1,
            nextColIdx + colCount + isLastCol
          ));
          console.log('CREATE STD FACE',
            currPt,
            currPt + 1,
            nextColIdx + colCount + isLastCol);
          faces.push(new three.Face3(
            currPt + 1,
            nextColIdx + colCount + isLastCol + 1,
            nextColIdx + colCount + isLastCol));
          console.log('CREATE STD FACE',
            currPt + 1,
            nextColIdx + colCount + isLastCol,
            nextColIdx + colCount + isLastCol + 1);

          // First point in each col needs to build a face to the corner
          if (colCount === 0 && !isLastCol) {
            faces.push(new three.Face3(
              currPt,
              nextColIdx,
              topCorner
            ));
            console.log('CREATE TOP CORNER FACE',
              currPt,
              nextColIdx,
              topCorner);
          }
          // Last point in each col needs to build a face to the corner
          if (colCount === ptsPerCol - 2) {
            if (!isLastCol) {
              faces.push(new three.Face3(
                currPt + 1,
                nextColIdx + ptsPerCol,
                bottomCorner
              ));
              console.log('CREATE BOTTOM CORNER FACE',
                currPt + 1,
                nextColIdx + ptsPerCol - 1,
                bottomCorner);
            }
          }

          console.log(currPt, colCount);

          colCount++;
          currPt++;
        }

        // Last point of first column then skips bottom corner
        if (isFirstCol) {
          console.log('Skip bottom corner');
          currPt++;
          isFirstCol = 0;
        }

        currPt++;
        console.log('----- end of col -----');
      }
      console.log('verts:', verts.length);
    },

    /**
     * Use edge radius to find a center point, and the use cos/sin to get
     * the points from that radius.
     * Calculate radius positions for the points
     *
     * @param radius {int}  The radius in inches
     *
     * @param angle {Number} The angle of the curve in radians
     */
    _getCurveCoords: function (radius, angle) {
      return [
        (radius * Math.cos(angle)).toFixed(5),
        (radius * Math.sin(angle)).toFixed(5)
      ]
    }
  };

  return Desktop;
});