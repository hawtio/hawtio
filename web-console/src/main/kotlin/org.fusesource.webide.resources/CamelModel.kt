package org.fusesource.webide.resources

import com.sun.jersey.spi.resource.Singleton
import javax.ws.rs.*

Path("/camelModel")
Produces("application/json")
Singleton
public open class CamelModel() {
/*
    GET
    Path("id/{id}")
    Produces("application/json")
    public open fun byId([PathParam("id")] id: String?): AbstractNode? {
        println("get id '$id'")
        val answer = collection.find { it.id == id }
        return answer
    }

    DELETE
    Path("id/{id}")
    Produces("application/json")
    public open fun remove(PathParam("id") id: String): AbstractNode? {
        println("remove id '$id'")
        val element = byId(id)
        if (element != null) {
            collection.remove(element)
        }
        return element
    }

    POST
    public open fun add(element: AbstractNode): AbstractNode {
        val id = element.id
        if (id != null) {
            remove(id)
        } else {
            element.id = nextId
        }
        println("add $element")
        collection.add(element)
        return element
    }
*/

}
